package ru.naumen.experts.feedback.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class FeedbackStatusResponse {

    private LocalDate currentWeekStart;
    private boolean canSubmitThisWeek;
    private boolean dueThisWeek;
    private FeedbackResponseDto currentWeekResponse;
    private FeedbackResponseDto lastResponse;
}
