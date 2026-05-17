package ru.naumen.experts.traineeplan.mapper;

import ru.naumen.experts.traineeplan.dto.TraineePlanTaskCommentResponse;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskResponse;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.entity.TraineePlanTaskComment;

import java.util.List;

public final class TraineePlanTaskMapper {

    private TraineePlanTaskMapper() {
    }

    public static TraineePlanTaskResponse toResponse(TraineePlanTask task, List<TraineePlanTaskComment> comments) {
        return TraineePlanTaskResponse.builder()
                .id(task.getId())
                .block(task.getBlock())
                .blockId(task.getBlock().getId())
                .description(task.getDescription())
                .deadline(task.getDeadline())
                .priority(task.getPriority())
                .acceptanceCriteria(task.getAcceptanceCriteria())
                .acceptanceCheckType(task.getAcceptanceCheckType())
                .status(task.getStatus())
                .startedAt(task.getStartedAt())
                .completedAt(task.getCompletedAt())
                .rejectionComment(task.getRejectionComment())
                .milestone(task.isMilestone())
                .comments(comments.stream().map(TraineePlanTaskMapper::toCommentResponse).toList())
                .build();
    }

    public static TraineePlanTaskResponse toResponse(TraineePlanTask task) {
        return toResponse(task, List.of());
    }

    public static TraineePlanTaskCommentResponse toCommentResponse(TraineePlanTaskComment comment) {
        return TraineePlanTaskCommentResponse.builder()
                .id(comment.getId())
                .authorFullName(comment.getAuthor().getFullName())
                .authorRole(comment.getAuthor().getRole())
                .text(comment.getText())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
