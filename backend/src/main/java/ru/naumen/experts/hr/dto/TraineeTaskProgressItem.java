package ru.naumen.experts.hr.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TraineeTaskProgressItem {

    private Long traineeId;
    private String fullName;
    private int totalTasks;
    private int completedTasks;
    private int completionPercent;
}
