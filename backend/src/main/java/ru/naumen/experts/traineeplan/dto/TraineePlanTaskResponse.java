package ru.naumen.experts.traineeplan.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.traineeplan.enums.AcceptanceCheckType;
import ru.naumen.experts.traineeplan.enums.TaskPriority;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class TraineePlanTaskResponse {

    private Long id;
    private TraineePlanBlock block;
    private String blockId;
    private String description;
    private LocalDate deadline;
    private TaskPriority priority;
    private String acceptanceCriteria;
    private AcceptanceCheckType acceptanceCheckType;
    private TaskStatus status;
    private OffsetDateTime startedAt;
    private OffsetDateTime completedAt;
    private String rejectionComment;
    private boolean milestone;
    private List<TraineePlanTaskCommentResponse> comments;
}
