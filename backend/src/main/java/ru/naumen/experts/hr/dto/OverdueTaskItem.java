package ru.naumen.experts.hr.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class OverdueTaskItem {

    private Long taskId;
    private String description;
    private LocalDate deadline;
    private long daysOverdue;
}
