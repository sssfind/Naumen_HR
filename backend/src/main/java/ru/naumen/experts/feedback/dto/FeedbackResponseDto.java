package ru.naumen.experts.feedback.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.feedback.enums.CommentRiskFlag;
import ru.naumen.experts.feedback.enums.CommentSentiment;
import ru.naumen.experts.feedback.enums.ResourceIssue;
import ru.naumen.experts.feedback.enums.SentimentLabel;
import ru.naumen.experts.feedback.enums.WeekRating;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class FeedbackResponseDto {

    private Long id;
    private LocalDate weekStart;
    private WeekRating weekRating;
    private Integer tasksClarity;
    private List<ResourceIssue> resourceIssues;
    private Integer mentorRating;
    private String weekComment;
    private Integer sentimentScore;
    private SentimentLabel sentimentLabel;
    private CommentSentiment commentSentiment;
    private List<CommentRiskFlag> commentRiskFlags;
    private String commentSummary;
    private OffsetDateTime commentAnalyzedAt;
    private OffsetDateTime createdAt;
}
