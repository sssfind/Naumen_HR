package ru.naumen.experts.template.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.naumen.experts.traineeplan.enums.AcceptanceCheckType;
import ru.naumen.experts.traineeplan.enums.TaskPriority;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;

@Data
public class PlanTemplateTaskRequest {

    @NotNull
    private TraineePlanBlock block;

    @NotBlank
    private String description;

    @NotBlank
    private String acceptanceCriteria;

    @NotNull
    private TaskPriority priority;

    @NotNull
    private AcceptanceCheckType acceptanceCheckType;

    @NotNull
    @Min(0)
    private Integer daysFromStart;

    @Min(0)
    private Integer sortOrder;
}
