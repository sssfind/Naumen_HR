package ru.naumen.experts.dictionary.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.dictionary.dto.ReadinessStatusDto;
import ru.naumen.experts.dictionary.dto.SkillDictionaryDto;
import ru.naumen.experts.skill.enums.SkillCategory;
import ru.naumen.experts.skill.repository.SkillRepository;
import ru.naumen.experts.skill.util.ExpertSkillDisplayNames;
import ru.naumen.experts.user.enums.ReadinessEventType;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DictionaryServiceImpl implements DictionaryService {

    private static final Map<ReadinessEventType, String> READINESS_LABELS = Map.of(
            ReadinessEventType.MENTORSHIP, "Менторство",
            ReadinessEventType.PUBLIC_SPEAKING, "Публичные выступления",
            ReadinessEventType.JURY_WORK, "Работа в жюри",
            ReadinessEventType.WORKSHOP_FACILITATION, "Ведение воркшопов",
            ReadinessEventType.LECTURE_DELIVERY, "Чтение лекций",
            ReadinessEventType.HACKATHON_PARTICIPATION, "Участие в хакатонах",
            ReadinessEventType.EVENT_ORGANIZATION, "Организация мероприятий"
    );

    private final SkillRepository skillRepository;

    @Override
    public List<SkillDictionaryDto> getHardSkills() {
        return skillRepository.findByCategoryAndIsActiveTrue(SkillCategory.PROFESSIONAL).stream()
                .map(s -> SkillDictionaryDto.builder().id(s.getId()).name(s.getName()).build())
                .toList();
    }

    @Override
    public List<SkillDictionaryDto> getExpertSkills() {
        return skillRepository.findByCategoryAndIsActiveTrue(SkillCategory.EXPERT).stream()
                .map(s -> SkillDictionaryDto.builder()
                        .id(s.getId())
                        .name(ExpertSkillDisplayNames.displayName(s))
                        .build())
                .toList();
    }

    @Override
    public List<ReadinessStatusDto> getReadinessStatuses() {
        return READINESS_LABELS.entrySet().stream()
                .map(e -> ReadinessStatusDto.builder()
                        .key(e.getKey().name())
                        .label(e.getValue())
                        .build())
                .toList();
    }
}
