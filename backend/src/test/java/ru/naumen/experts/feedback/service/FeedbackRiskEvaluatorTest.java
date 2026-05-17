package ru.naumen.experts.feedback.service;

import org.junit.jupiter.api.Test;
import ru.naumen.experts.feedback.entity.FeedbackResponse;
import ru.naumen.experts.feedback.enums.CommentRiskFlag;
import ru.naumen.experts.feedback.enums.CommentSentiment;
import ru.naumen.experts.feedback.enums.SentimentLabel;
import ru.naumen.experts.feedback.enums.WeekRating;

import static org.assertj.core.api.Assertions.assertThat;

class FeedbackRiskEvaluatorTest {

    @Test
    void commentRiskFlagsTriggerRisk() {
        FeedbackResponse feedback = FeedbackResponse.builder()
                .weekRating(WeekRating.GOOD)
                .tasksClarity(5)
                .mentorRating(5)
                .resourceIssues("ALL_OK")
                .commentSentiment(CommentSentiment.NEUTRAL)
                .commentRiskFlags(CommentRiskFlagsCodec.encode(java.util.List.of(CommentRiskFlag.STRESS)))
                .sentimentLabel(SentimentLabel.POSITIVE)
                .sentimentScore(80)
                .build();

        assertThat(FeedbackRiskEvaluator.isRisk(feedback)).isTrue();
        assertThat(FeedbackRiskEvaluator.buildRiskSummary(feedback)).contains("стресс");
    }
}
