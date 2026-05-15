package ru.naumen.experts.expert.dto;

import lombok.Data;
import ru.naumen.experts.user.enums.ReadinessEventType;

import java.util.List;

@Data
public class ExpertSearchCriteriaDTO {
    private String query;
    private List<Long> hardSkillIds;
    private List<Long> expertSkillIds;
    private List<ReadinessEventType> readinessStatuses;
    private ExpertSortMode sortMode = ExpertSortMode.RECOMMEND_NEWCOMERS;

    // Обратная совместимость — фильтрация по именам
    private List<String> hardSkills;
    private List<String> expertSkills;
}
