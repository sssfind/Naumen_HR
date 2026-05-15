package ru.naumen.experts.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.event.entity.UserEventExperience;
import ru.naumen.experts.event.repository.UserEventExperienceRepository;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.skill.entity.UserSkill;
import ru.naumen.experts.skill.enums.SkillCategory;
import ru.naumen.experts.skill.util.ExpertSkillDisplayNames;
import ru.naumen.experts.skill.repository.UserSkillRepository;
import ru.naumen.experts.user.dto.UserCardEventDto;
import ru.naumen.experts.user.dto.UserCardSimilarPersonDto;
import ru.naumen.experts.user.dto.UserCardSkillDto;
import ru.naumen.experts.user.dto.UserProfileCardResponse;
import ru.naumen.experts.user.dto.UserProfileResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.entity.UserReadiness;
import ru.naumen.experts.user.enums.ReadinessEventType;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserEventExperienceRepository userEventExperienceRepository;
    private final UserSkillRepository userSkillRepository;

    @Override
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findWithReadinessById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        NameParts nameParts = splitFullName(user.getFullName());
        String firstName = nameParts.firstName();
        String lastName = nameParts.lastName();

        String initials = buildInitials(firstName, lastName);

        List<ReadinessEventType> readiness = safeReadiness(user);

        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(firstName)
                .lastName(lastName)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .role(user.getRole())
                .initials(initials)
                .readiness(readiness)
                .build();
    }

    @Override
    public UserProfileCardResponse getProfileCard(Long userId) {
        User user = userRepository.findWithReadinessById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        NameParts nameParts = splitFullName(user.getFullName());
        String initials = buildInitials(nameParts.firstName(), nameParts.lastName());

        List<ReadinessEventType> readiness = safeReadiness(user);

        // Важно: не делаем JOIN FETCH сразу для readiness и userSkills — Hibernate запрещает
        // одновременный fetch нескольких "bag" коллекций (MultipleBagFetchException).
        // Поэтому навыки подгружаем отдельным запросом.
        List<UserSkill> skills = userSkillRepository.findWithSkillByUserIdIn(List.of(userId));

        List<UserCardSkillDto> professionalSkills = mapSkills(skills, SkillCategory.PROFESSIONAL);
        List<UserCardSkillDto> expertSkills = mapSkills(skills, SkillCategory.EXPERT);

        List<UserCardEventDto> events = mapEvents(userId);

        List<UserCardSimilarPersonDto> similarPeople = buildSimilarPeople(user, skills);

        return UserProfileCardResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .role(user.getRole())
                .initials(initials)
                .readiness(readiness)
                .professionalSkills(professionalSkills)
                .expertSkills(expertSkills)
                .events(events)
                .similarPeople(similarPeople)
                .build();
    }

    private List<ReadinessEventType> safeReadiness(User user) {
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

    private List<UserCardSkillDto> mapSkills(List<UserSkill> skills, SkillCategory category) {
        return skills.stream()
                .filter(us -> us.getSkill() != null && us.getSkill().getCategory() == category)
                .sorted(Comparator.comparingInt((UserSkill us) -> us.getStars() != null ? us.getStars() : 0).reversed()
                        .thenComparing(us -> ExpertSkillDisplayNames.displayName(us.getSkill())))
                .map(this::toUserCardSkillDto)
                .toList();
    }

    private UserCardSkillDto toUserCardSkillDto(UserSkill us) {
        return UserCardSkillDto.builder()
                .userSkillId(us.getId())
                .id(us.getSkill().getId())
                .name(ExpertSkillDisplayNames.displayName(us.getSkill()))
                .stars(us.getStars() != null ? us.getStars() : 0)
                .proficiencyLevel(us.getProficiencyLevel())
                .build();
    }

    private List<UserCardEventDto> mapEvents(Long userId) {
        List<UserEventExperience> rows = userEventExperienceRepository.findByUserIdWithEvents(userId);
        if (rows.isEmpty()) {
            return List.of();
        }
        return rows.stream()
                .sorted(Comparator
                        .comparing((UserEventExperience uee) -> uee.getEvent().getEventDate(),
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .reversed()
                        .thenComparing(uee -> uee.getEvent().getTitle(), Comparator.nullsLast(String::compareTo)))
                .map(uee -> UserCardEventDto.builder()
                        .title(uee.getEvent().getTitle())
                        .eventType(uee.getEvent().getEventType())
                        .eventDate(uee.getEvent().getEventDate())
                        .participationRole(uee.getParticipationRole())
                        .resultLevel(uee.getResultLevel())
                        .feedback(uee.getFeedback() != null ? uee.getFeedback() : "")
                        .build())
                .toList();
    }

    private List<UserCardSimilarPersonDto> buildSimilarPeople(User user, List<UserSkill> mySkills) {
        List<Long> mySkillIds = mySkills.stream()
                .map(us -> us.getSkill().getId())
                .distinct()
                .toList();

        String dept = user.getDepartment();
        int deptMode = (dept != null && !dept.isBlank()) ? 1 : 0;
        String departmentParam = deptMode == 1 ? dept : "";

        List<SimilarScore> scored = new ArrayList<>();
        if (mySkillIds.isEmpty()) {
            userRepository.findSimilarCandidatesWithoutOverlap(
                            user.getId(), deptMode, departmentParam, PageRequest.of(0, 5))
                    .forEach(u -> scored.add(new SimilarScore(u.getId(), 0)));
        } else {
            for (Object[] row : userRepository.findTopSimilarUserIdsBySkillOverlap(
                    user.getId(), mySkillIds, deptMode, departmentParam)) {
                long id = ((Number) row[0]).longValue();
                int overlap = ((Number) row[1]).intValue();
                scored.add(new SimilarScore(id, overlap));
            }
        }

        if (scored.isEmpty()) {
            return List.of();
        }

        List<Long> ids = scored.stream().map(SimilarScore::userId).toList();
        Map<Long, User> userById = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<UserSkill> batchSkills = ids.isEmpty()
                ? List.of()
                : userSkillRepository.findWithSkillByUserIdIn(ids);
        Map<Long, List<String>> topSkillNames = topSkillNamesByUser(batchSkills, 3);

        List<UserCardSimilarPersonDto> result = new ArrayList<>();
        for (SimilarScore ss : scored) {
            User u = userById.get(ss.userId());
            if (u == null) {
                continue;
            }
            List<String> names = topSkillNames.getOrDefault(ss.userId(), List.of());
            List<String> top = names.isEmpty() ? List.of() : names.subList(0, Math.min(3, names.size()));
            result.add(UserCardSimilarPersonDto.builder()
                    .id(u.getId())
                    .fullName(u.getFullName())
                    .department(u.getDepartment())
                    .topSkills(top)
                    .overlapCount(ss.overlap())
                    .build());
        }
        return result;
    }

    private Map<Long, List<String>> topSkillNamesByUser(List<UserSkill> userSkills, int maxPerUser) {
        Map<Long, List<UserSkill>> byUser = userSkills.stream()
                .collect(Collectors.groupingBy(us -> us.getUser().getId()));
        Map<Long, List<String>> out = new HashMap<>();
        for (Map.Entry<Long, List<UserSkill>> e : byUser.entrySet()) {
            List<String> names = e.getValue().stream()
                    .filter(us -> us.getSkill() != null)
                    .sorted(Comparator.comparingInt((UserSkill us) -> us.getStars() != null ? us.getStars() : 0).reversed()
                            .thenComparing(us -> ExpertSkillDisplayNames.displayName(us.getSkill())))
                    .limit(maxPerUser)
                    .map(us -> ExpertSkillDisplayNames.displayName(us.getSkill()))
                    .toList();
            out.put(e.getKey(), names);
        }
        return out;
    }

    private NameParts splitFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new NameParts("", "");
        }

        String[] parts = fullName.trim().split("\\s+", 2);
        String firstName = parts.length > 0 ? parts[0] : "";
        String lastName = parts.length > 1 ? parts[1] : "";
        return new NameParts(firstName, lastName);
    }

    private String buildInitials(String firstName, String lastName) {
        StringBuilder sb = new StringBuilder();
        if (!firstName.isEmpty()) {
            sb.append(Character.toUpperCase(firstName.charAt(0)));
        }
        if (!lastName.isEmpty()) {
            sb.append(Character.toUpperCase(lastName.charAt(0)));
        }
        return sb.toString();
    }

    private record NameParts(String firstName, String lastName) {}

    private record SimilarScore(long userId, int overlap) {}
}
