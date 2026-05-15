package ru.naumen.experts.dictionary.service;

import ru.naumen.experts.dictionary.dto.ReadinessStatusDto;
import ru.naumen.experts.dictionary.dto.SkillDictionaryDto;

import java.util.List;

public interface DictionaryService {
    List<SkillDictionaryDto> getHardSkills();
    List<SkillDictionaryDto> getExpertSkills();
    List<ReadinessStatusDto> getReadinessStatuses();
}
