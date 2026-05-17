package ru.naumen.experts.feedback.service;

import org.junit.jupiter.api.Test;
import ru.naumen.experts.feedback.dto.SubmitFeedbackRequest;
import ru.naumen.experts.feedback.enums.ResourceIssue;
import ru.naumen.experts.feedback.enums.SentimentLabel;
import ru.naumen.experts.feedback.enums.WeekRating;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FeedbackStructuredSentimentCalculatorTest {

    @Test
    void excellentSurveyYieldsPositiveLabel() {
        SubmitFeedbackRequest request = new SubmitFeedbackRequest();
        request.setWeekRating(WeekRating.EXCELLENT);
        request.setTasksClarity(5);
        request.setMentorRating(5);
        request.setResourceIssues(List.of(ResourceIssue.ALL_OK));

        var result = FeedbackStructuredSentimentCalculator.calculate(request);

        assertThat(result.score()).isGreaterThanOrEqualTo(75);
        assertThat(result.label()).isEqualTo(SentimentLabel.POSITIVE);
    }

    @Test
    void needHelpForcesAtRiskLabel() {
        SubmitFeedbackRequest request = new SubmitFeedbackRequest();
        request.setWeekRating(WeekRating.NEED_HELP);
        request.setTasksClarity(5);
        request.setMentorRating(5);
        request.setResourceIssues(List.of(ResourceIssue.ALL_OK));

        var result = FeedbackStructuredSentimentCalculator.calculate(request);

        assertThat(result.label()).isEqualTo(SentimentLabel.AT_RISK);
    }
}
