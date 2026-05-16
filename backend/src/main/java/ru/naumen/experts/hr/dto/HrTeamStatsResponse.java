package ru.naumen.experts.hr.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HrTeamStatsResponse {

    private int traineeCount;
    private Double averageMoodLevel;
    private int averageTaskCompletionPercent;
    private List<TraineeTaskProgressItem> traineeProgress;
}
