package ru.naumen.experts.expert.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.event.entity.UserEventExperience;
import ru.naumen.experts.event.repository.UserEventExperienceRepository;
import ru.naumen.experts.expert.dto.ExpertResponseDTO;
import ru.naumen.experts.expert.dto.ExpertSearchCriteriaDTO;
import ru.naumen.experts.expert.dto.ExpertSortMode;
import ru.naumen.experts.expert.dto.SkillDto;
import ru.naumen.experts.expert.specification.UserSpecification;
import ru.naumen.experts.skill.entity.UserSkill;
import ru.naumen.experts.skill.enums.SkillCategory;
import ru.naumen.experts.skill.util.ExpertSkillDisplayNames;
import ru.naumen.experts.skill.repository.PeerSkillStarVoteRepository;
import ru.naumen.experts.skill.repository.UserSkillRepository;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.entity.UserReadiness;
import ru.naumen.experts.user.enums.ReadinessEventType;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpertSearchServiceImpl implements ExpertSearchService {

    private static final int TOP_SKILLS_LIMIT = 5;
    private static final int TOP_EVENTS_LIMIT = 5;
    private static final double NEWCOMER_FRACTION = 0.30;
    private static final String HARD_SKILL_LABEL = "HARD";
    private static final String EXPERT_SKILL_LABEL = "EXPERT";

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserEventExperienceRepository userEventExperienceRepository;
    private final PeerSkillStarVoteRepository peerSkillStarVoteRepository;

    @Override
    public Page<ExpertResponseDTO> searchExperts(ExpertSearchCriteriaDTO criteria, Pageable pageable, Long viewerUserId) {
        UserSpecification.ExpertSearchCriteriaRef criteriaRef = new UserSpecification.ExpertSearchCriteriaRef(
                criteria.getQuery(),
                criteria.getHardSkillIds(),
                criteria.getExpertSkillIds(),
                criteria.getReadinessStatuses(),
                criteria.getHardSkills(),
                criteria.getExpertSkills()
        );

        Specification<User> spec = UserSpecification.buildSearchSpec(criteriaRef);

        List<User> allMatching = userRepository.findAll(spec, Sort.by("fullName"));
        if (allMatching.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<Long> allIds = allMatching.stream().map(User::getId).toList();
        Map<Long, Long> skillCountByUser = toCountMap(userSkillRepository.countSkillsByUserIdIn(allIds));
        Map<Long, Long> eventCountByUser = toCountMap(userEventExperienceRepository.countEventsByUserIdIn(allIds));
        List<Long> selectedSkillIds = mergeSelectedSkillIds(criteria);
        Map<Long, Long> selectedSkillStarsByUser = selectedSkillIds.isEmpty()
                ? Map.of()
                : toCountMap(userSkillRepository.sumStarsByUserIdAndSkillIdIn(allIds, selectedSkillIds));

        List<ActivityUser> scored = allMatching.stream()
                .map(u -> {
                    long sid = u.getId();
                    long skills = skillCountByUser.getOrDefault(sid, 0L);
                    long events = eventCountByUser.getOrDefault(sid, 0L);
                    return new ActivityUser(u, skills + events);
                })
                .sorted(Comparator.comparingLong(ActivityUser::activity)
                        .thenComparing(a -> a.user().getId()))
                .toList();

        int n = scored.size();
        int newbieSlots = (int) Math.ceil(n * NEWCOMER_FRACTION);
        newbieSlots = Math.min(Math.max(newbieSlots, 1), n);

        Set<Long> newcomerIds = scored.stream()
                .limit(newbieSlots)
                .map(a -> a.user().getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<User> newcomersOrdered = scored.stream()
                .limit(newbieSlots)
                .map(ActivityUser::user)
                .toList();

        List<User> othersOrdered = allMatching.stream()
                .filter(u -> !newcomerIds.contains(u.getId()))
                .sorted(Comparator.comparing(User::getFullName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        List<User> ordered = orderUsers(allMatching, newcomerIds, newcomersOrdered, othersOrdered,
                selectedSkillStarsByUser, criteria.getSortMode());

        long total = ordered.size();
        int start = (int) pageable.getOffset();
        if (start >= ordered.size()) {
            return new PageImpl<>(List.of(), pageable, total);
        }
        int end = Math.min(start + pageable.getPageSize(), ordered.size());
        List<User> slice = ordered.subList(start, end);
        List<Long> sliceIds = slice.stream().map(User::getId).toList();

        Map<Long, List<UserSkill>> skillsByUser = sliceIds.isEmpty()
                ? Map.of()
                : userSkillRepository.findTopSkillsByUserIds(sliceIds).stream()
                    .collect(Collectors.groupingBy(us -> us.getUser().getId()));

        Map<Long, List<String>> eventsByUser = loadRecentEventTitlesByUser(sliceIds);

        Set<Long> viewerVotedUserSkillIds = resolveViewerVotedUserSkillIds(viewerUserId, skillsByUser);

        List<ExpertResponseDTO> content = slice.stream()
                .map(user -> {
                    long uid = user.getId();
                    long activity =
                            skillCountByUser.getOrDefault(uid, 0L) + eventCountByUser.getOrDefault(uid, 0L);
                    return toDto(
                            user,
                            skillsByUser.getOrDefault(uid, List.of()),
                            eventsByUser.getOrDefault(uid, List.of()),
                            viewerVotedUserSkillIds,
                            newcomerIds.contains(uid),
                            activity,
                            selectedSkillStarsByUser.getOrDefault(uid, 0L));
                })
                .toList();

        return new PageImpl<>(content, pageable, total);
    }

    private List<User> orderUsers(List<User> allMatching,
                                  Set<Long> newcomerIds,
                                  List<User> newcomersOrdered,
                                  List<User> othersOrdered,
                                  Map<Long, Long> selectedSkillStarsByUser,
                                  ExpertSortMode sortMode) {
        ExpertSortMode effectiveSortMode =
                sortMode != null ? sortMode : ExpertSortMode.RECOMMEND_NEWCOMERS;

        if (effectiveSortMode == ExpertSortMode.RECOMMEND_NEWCOMERS) {
            List<User> ordered = new ArrayList<>(newcomersOrdered.size() + othersOrdered.size());
            ordered.addAll(newcomersOrdered);
            ordered.addAll(othersOrdered);
            return ordered;
        }

        Comparator<User> byFullName =
                Comparator.comparing(User::getFullName, Comparator.nullsLast(String::compareToIgnoreCase));
        Comparator<User> byId = Comparator.comparing(User::getId, Comparator.nullsLast(Long::compareTo));

        Comparator<User> starsComparator = Comparator
                .comparingLong((User user) -> selectedSkillStarsByUser.getOrDefault(user.getId(), 0L));

        if (effectiveSortMode == ExpertSortMode.SELECTED_STARS_DESC) {
            starsComparator = starsComparator.reversed();
        }

        return allMatching.stream()
                .sorted(starsComparator
                        .thenComparing((User user) -> !newcomerIds.contains(user.getId()))
                        .thenComparing(byFullName)
                        .thenComparing(byId))
                .toList();
    }

    private static List<Long> mergeSelectedSkillIds(ExpertSearchCriteriaDTO criteria) {
        return Stream.concat(
                        safeStream(criteria.getHardSkillIds()),
                        safeStream(criteria.getExpertSkillIds()))
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private static <T> Stream<T> safeStream(List<T> values) {
        return values == null ? Stream.empty() : values.stream();
    }

    private record ActivityUser(User user, long activity) {
    }

    private static Map<Long, Long> toCountMap(List<Object[]> rows) {
        Map<Long, Long> map = new HashMap<>();
        if (rows == null) {
            return map;
        }
        for (Object[] row : rows) {
            if (row == null || row.length < 2 || row[0] == null || row[1] == null) {
                continue;
            }
            map.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        return map;
    }

    private Set<Long> resolveViewerVotedUserSkillIds(Long viewerUserId, Map<Long, List<UserSkill>> skillsByUser) {
        if (viewerUserId == null || skillsByUser.isEmpty()) {
            return Set.of();
        }
        List<Long> allIds = skillsByUser.values().stream()
                .flatMap(List::stream)
                .map(UserSkill::getId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (allIds.isEmpty()) {
            return Set.of();
        }
        return new HashSet<>(peerSkillStarVoteRepository.findVotedUserSkillIds(viewerUserId, allIds));
    }

    private ExpertResponseDTO toDto(User user, List<UserSkill> userSkills, List<String> eventTitles,
                                    Set<Long> viewerVotedUserSkillIds, boolean newcomer, long activityScore,
                                    long selectedSkillStars) {
        return ExpertResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .topSkills(mapTopSkills(userSkills, viewerVotedUserSkillIds))
                .readiness(mapReadiness(user))
                .events(eventTitles)
                .newcomer(newcomer)
                .activityScore(activityScore)
                .selectedSkillStars(selectedSkillStars)
                .build();
    }

    private List<SkillDto> mapTopSkills(List<UserSkill> userSkills, Set<Long> viewerVotedUserSkillIds) {
        return userSkills.stream()
                .sorted(Comparator.comparingInt((UserSkill us) -> starsOrZero(us.getStars())).reversed()
                        .thenComparing(us -> us.getSkill() != null ? ExpertSkillDisplayNames.displayName(us.getSkill()) : ""))
                .limit(TOP_SKILLS_LIMIT)
                .map(us -> toSkillDto(us, viewerVotedUserSkillIds))
                .toList();
    }

    private SkillDto toSkillDto(UserSkill userSkill, Set<Long> viewerVotedUserSkillIds) {
        return SkillDto.builder()
                .userSkillId(userSkill.getId())
                .name(ExpertSkillDisplayNames.displayName(userSkill.getSkill()))
                .category(toSkillCategoryLabel(userSkill.getSkill().getCategory()))
                .stars(starsOrZero(userSkill.getStars()))
                .viewerPeerStarGiven(viewerVotedUserSkillIds.contains(userSkill.getId()))
                .build();
    }

    private static int starsOrZero(Integer stars) {
        return stars != null ? stars : 0;
    }

    private String toSkillCategoryLabel(SkillCategory category) {
        return category == SkillCategory.PROFESSIONAL ? HARD_SKILL_LABEL : EXPERT_SKILL_LABEL;
    }

    private List<ReadinessEventType> mapReadiness(User user) {
        if (user.getReadiness() == null) {
            return List.of();
        }
        return user.getReadiness().stream()
                .map(UserReadiness::getReadinessEventType)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.comparing(Enum::name))
                .toList();
    }

    private Map<Long, List<String>> loadRecentEventTitlesByUser(List<Long> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }
        List<UserEventExperience> rows = userEventExperienceRepository.findByUserIdsWithEvents(userIds);
        Map<Long, List<UserEventExperience>> byUser = rows.stream()
                .collect(Collectors.groupingBy(uee -> uee.getUser().getId()));

        Map<Long, List<String>> out = new LinkedHashMap<>();
        for (Long userId : userIds) {
            List<UserEventExperience> forUser = byUser.getOrDefault(userId, List.of());
            List<UserEventExperience> sorted = forUser.stream()
                    .sorted(Comparator
                            .comparing((UserEventExperience uee) -> uee.getEvent().getEventDate(),
                                    Comparator.nullsLast(Comparator.naturalOrder()))
                            .reversed()
                            .thenComparing(uee -> uee.getEvent().getTitle(), Comparator.nullsLast(String::compareTo)))
                    .toList();

            LinkedHashSet<String> titles = new LinkedHashSet<>();
            for (UserEventExperience uee : sorted) {
                String title = uee.getEvent() != null ? uee.getEvent().getTitle() : null;
                if (title != null && !title.isBlank()) {
                    titles.add(title);
                }
                if (titles.size() >= TOP_EVENTS_LIMIT) {
                    break;
                }
            }
            out.put(userId, new ArrayList<>(titles));
        }
        return out;
    }
}
