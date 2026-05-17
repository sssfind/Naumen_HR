package ru.naumen.experts.feedback.service;

import ru.naumen.experts.feedback.entity.FeedbackResponse;
import ru.naumen.experts.feedback.enums.CommentRiskFlag;
import ru.naumen.experts.feedback.enums.CommentSentiment;
import ru.naumen.experts.feedback.enums.ResourceIssue;
import ru.naumen.experts.feedback.enums.SentimentLabel;
import ru.naumen.experts.feedback.enums.WeekRating;

import java.util.List;

public final class FeedbackRiskEvaluator {

    private static final int RISK_CLARITY_THRESHOLD = 2;
    private static final int RISK_MENTOR_THRESHOLD = 2;

    private FeedbackRiskEvaluator() {
    }

    public static boolean isRisk(FeedbackResponse feedback) {
        if (hasStructuredRiskSignals(
                feedback.getWeekRating(),
                feedback.getTasksClarity(),
                feedback.getMentorRating(),
                FeedbackResourceIssuesCodec.decode(feedback.getResourceIssues()))) {
            return true;
        }
        if (feedback.getSentimentLabel() == SentimentLabel.AT_RISK) {
            return true;
        }
        if (feedback.getCommentSentiment() == CommentSentiment.NEGATIVE) {
            return true;
        }
        List<CommentRiskFlag> commentFlags = CommentRiskFlagsCodec.decode(feedback.getCommentRiskFlags());
        return !commentFlags.isEmpty();
    }

    public static boolean hasStructuredRiskSignals(
            WeekRating rating,
            int tasksClarity,
            int mentorRating,
            List<ResourceIssue> issues) {
        if (rating == WeekRating.STRESSED || rating == WeekRating.NEED_HELP) {
            return true;
        }
        if (tasksClarity <= RISK_CLARITY_THRESHOLD) {
            return true;
        }
        if (mentorRating <= RISK_MENTOR_THRESHOLD) {
            return true;
        }
        return issues.stream().anyMatch(issue -> issue != ResourceIssue.ALL_OK);
    }

    public static String buildRiskSummary(FeedbackResponse feedback) {
        StringBuilder sb = new StringBuilder();
        WeekRating rating = feedback.getWeekRating();
        if (rating == WeekRating.NEED_HELP) {
            sb.append("запрошена помощь HR");
        } else if (rating == WeekRating.STRESSED) {
            sb.append("тяжёлая неделя, стресс");
        }
        if (feedback.getTasksClarity() <= RISK_CLARITY_THRESHOLD) {
            appendDetail(sb, "задачи непонятны (" + feedback.getTasksClarity() + "/5)");
        }
        if (feedback.getMentorRating() <= RISK_MENTOR_THRESHOLD) {
            appendDetail(sb, "низкая оценка наставника (" + feedback.getMentorRating() + "/5)");
        }
        List<ResourceIssue> issues = FeedbackResourceIssuesCodec.decode(feedback.getResourceIssues());
        if (issues.stream().anyMatch(issue -> issue != ResourceIssue.ALL_OK)) {
            appendDetail(sb, "проблемы с доступами или ресурсами");
        }

        List<CommentRiskFlag> commentFlags = CommentRiskFlagsCodec.decode(feedback.getCommentRiskFlags());
        for (CommentRiskFlag flag : commentFlags) {
            appendDetail(sb, commentFlagLabel(flag));
        }
        if (feedback.getCommentSentiment() == CommentSentiment.NEGATIVE) {
            appendDetail(sb, "негативный тон комментария");
        }
        if (feedback.getSentimentScore() != null && feedback.getSentimentScore() < 40) {
            appendDetail(sb, "индекс адаптации " + feedback.getSentimentScore() + "/100");
        }
        if (feedback.getCommentSummary() != null && !feedback.getCommentSummary().isBlank()) {
            appendDetail(sb, feedback.getCommentSummary());
        }
        return sb.toString();
    }

    private static String commentFlagLabel(CommentRiskFlag flag) {
        return switch (flag) {
            case STRESS -> "стресс (анализ комментария)";
            case UNCLEAR_TASKS -> "непонятность задач (комментарий)";
            case LOW_ENGAGEMENT -> "низкая вовлечённость (комментарий)";
            case ACCESS_ISSUES -> "доступы/ресурсы (комментарий)";
        };
    }

    private static void appendDetail(StringBuilder sb, String detail) {
        if (!sb.isEmpty()) {
            sb.append(", ");
        }
        sb.append(detail);
    }
}
