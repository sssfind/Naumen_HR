package ru.naumen.experts.hr.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TraineeOverdueTasksItem {

    private Long traineeId;
    private String fullName;
    private int overdueCount;
    private List<OverdueTaskItem> tasks;
}
