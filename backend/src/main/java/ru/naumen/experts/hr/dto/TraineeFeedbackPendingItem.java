package ru.naumen.experts.hr.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TraineeFeedbackPendingItem {

    private Long traineeId;
    private String fullName;
    private LocalDate weekStart;
}
