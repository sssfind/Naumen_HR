package ru.naumen.experts.traineeplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.naumen.experts.traineeplan.enums.AcceptanceCheckType;
import ru.naumen.experts.traineeplan.enums.TaskPriority;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;

import java.time.LocalDate;

@Data
public class TraineePlanTaskRequest {

    @NotNull
    private TraineePlanBlock block;

    @NotBlank
    private String description;

    @NotNull
    private LocalDate deadline;

    @NotNull
    private TaskPriority priority;

    @NotBlank
    private String acceptanceCriteria;

    @NotNull
    private AcceptanceCheckType acceptanceCheckType;
}
