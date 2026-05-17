package ru.naumen.experts.feedback.service;

import ru.naumen.experts.feedback.dto.SubmitFeedbackRequest;
import ru.naumen.experts.feedback.enums.ResourceIssue;
import ru.naumen.experts.feedback.enums.SentimentLabel;
import ru.naumen.experts.feedback.enums.WeekRating;

import java.util.List;

/**
 * Сводный индекс настроения по шкалам опроса (без NLP).
 */
public final class FeedbackStructuredSentimentCalculator {

    private FeedbackStructuredSentimentCalculator() {
    }

    public record StructuredSentiment(int score, SentimentLabel label) {
    }

    public static StructuredSentiment calculate(SubmitFeedbackRequest request) {
        int weekScore = weekRatingScore(request.getWeekRating());
        int clarityScore = scaleToPercent(request.getTasksClarity());
        int mentorScore = scaleToPercent(request.getMentorRating());
        int resourceScore = resourceScore(request.getResourceIssues());

        double weighted = weekScore * 0.40
                + clarityScore * 0.25
                + mentorScore * 0.25
                + resourceScore * 0.10;

        int score = (int) Math.round(Math.clamp(weighted, 0, 100));
        SentimentLabel label = labelFromScore(score, request);
        return new StructuredSentiment(score, label);
    }

    public static StructuredSentiment recalculateFromEntity(
            WeekRating weekRating,
            int tasksClarity,
            int mentorRating,
            String resourceIssuesEncoded) {
        List<ResourceIssue> issues = FeedbackResourceIssuesCodec.decode(resourceIssuesEncoded);
        int weekScore = weekRatingScore(weekRating);
        int clarityScore = scaleToPercent(tasksClarity);
        int mentorScore = scaleToPercent(mentorRating);
        int resourceScore = resourceScore(issues);

        double weighted = weekScore * 0.40
                + clarityScore * 0.25
                + mentorScore * 0.25
                + resourceScore * 0.10;

        int score = (int) Math.round(Math.clamp(weighted, 0, 100));
        SentimentLabel label = labelFromScore(score, weekRating, tasksClarity, mentorRating, issues);
        return new StructuredSentiment(score, label);
    }

    private static int weekRatingScore(WeekRating rating) {
        return switch (rating) {
            case EXCELLENT -> 100;
            case GOOD -> 80;
            case OKAY_DIFFICULT -> 60;
            case STRESSED -> 30;
            case NEED_HELP -> 10;
        };
    }

    private static int scaleToPercent(int value) {
        return (int) Math.round((value / 5.0) * 100);
    }

    private static int resourceScore(List<ResourceIssue> issues) {
        if (issues == null || issues.isEmpty()) {
            return 100;
        }
        boolean allOk = issues.stream().allMatch(i -> i == ResourceIssue.ALL_OK);
        return allOk ? 100 : 40;
    }

    private static SentimentLabel labelFromScore(int score, SubmitFeedbackRequest request) {
        return labelFromScore(
                score,
                request.getWeekRating(),
                request.getTasksClarity(),
                request.getMentorRating(),
                request.getResourceIssues());
    }

    private static SentimentLabel labelFromScore(
            int score,
            WeekRating weekRating,
            int tasksClarity,
            int mentorRating,
            List<ResourceIssue> resourceIssues) {
        if (FeedbackRiskEvaluator.hasStructuredRiskSignals(weekRating, tasksClarity, mentorRating, resourceIssues)) {
            return SentimentLabel.AT_RISK;
        }
        if (score >= 75) {
            return SentimentLabel.POSITIVE;
        }
        if (score >= 50) {
            return SentimentLabel.NEUTRAL;
        }
        if (score >= 35) {
            return SentimentLabel.NEGATIVE;
        }
        return SentimentLabel.AT_RISK;
    }
}
