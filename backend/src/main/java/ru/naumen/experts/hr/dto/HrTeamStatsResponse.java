package ru.naumen.experts.hr.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HrTeamStatsResponse {

    private int traineeCount;
    private Double averageMoodLevel;
    private int averageTaskCompletionPercent;
}
