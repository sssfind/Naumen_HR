package ru.naumen.experts.hr.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class HrAdaptationDashboardResponse {

    private int traineeCount;
    private Double averageMoodLevel;
    private int averageTaskCompletionPercent;
    private List<TraineeTaskProgressItem> traineeProgress;

    private LocalDate currentWeekStart;
    private int atRiskCount;
    private int feedbackPendingCount;
    private int traineesWithOverdueTasksCount;

    private List<TraineeRiskAlertItem> atRisk;
    private List<TraineeFeedbackPendingItem> feedbackPending;
    private List<TraineeOverdueTasksItem> overdueByTrainee;
}
