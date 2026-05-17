package ru.naumen.experts.traineeplan.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PendingReviewTaskResponse {

    private Long traineeId;
    private String traineeFullName;
    private String traineeTeam;
    private TraineePlanTaskResponse task;
}
