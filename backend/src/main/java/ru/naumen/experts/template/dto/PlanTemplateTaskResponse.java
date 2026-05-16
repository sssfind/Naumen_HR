package ru.naumen.experts.template.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.traineeplan.enums.AcceptanceCheckType;
import ru.naumen.experts.traineeplan.enums.TaskPriority;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;

@Data
@Builder
public class PlanTemplateTaskResponse {

    private Long id;
    private TraineePlanBlock block;
    private String blockId;
    private String description;
    private String acceptanceCriteria;
    private TaskPriority priority;
    private AcceptanceCheckType acceptanceCheckType;
    private Integer daysFromStart;
    private Integer sortOrder;
    private boolean milestone;
}
