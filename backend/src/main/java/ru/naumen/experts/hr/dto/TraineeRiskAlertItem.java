package ru.naumen.experts.hr.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.feedback.enums.SentimentLabel;
import ru.naumen.experts.feedback.enums.WeekRating;

import java.time.LocalDate;

@Data
@Builder
public class TraineeRiskAlertItem {

    private Long traineeId;
    private String fullName;
    private Integer moodLevel;
    private LocalDate feedbackWeekStart;
    private WeekRating weekRating;
    private Integer sentimentScore;
    private SentimentLabel sentimentLabel;
    private String commentSummary;
    private String riskSummary;
}
