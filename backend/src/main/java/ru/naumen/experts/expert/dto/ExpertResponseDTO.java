package ru.naumen.experts.expert.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.user.enums.ReadinessEventType;

import java.util.List;

@Data
@Builder
public class ExpertResponseDTO {
    private Long id;
    private String fullName;
    private String department;
    private List<SkillDto> topSkills;
    private List<ReadinessEventType> readiness;
    private List<String> events;
    /** Нижние ~30% по сумме (все навыки + все мероприятия) среди результатов поиска */
    private boolean newcomer;
    /** Сумма всех записей навыков и посещённых мероприятий в БД (для клиентской сортировки вместе с моками) */
    private long activityScore;
    /** Сумма звёзд по выбранным дисциплинам для текущего поискового запроса */
    private long selectedSkillStars;
}
