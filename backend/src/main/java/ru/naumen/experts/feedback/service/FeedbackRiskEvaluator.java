package ru.naumen.experts.feedback.service;

import ru.naumen.experts.feedback.entity.FeedbackResponse;
import ru.naumen.experts.feedback.enums.ResourceIssue;
import ru.naumen.experts.feedback.enums.WeekRating;

import java.util.List;

public final class FeedbackRiskEvaluator {

    private static final int RISK_CLARITY_THRESHOLD = 2;
    private static final int RISK_MENTOR_THRESHOLD = 2;

    private FeedbackRiskEvaluator() {
    }

    public static boolean isRisk(FeedbackResponse feedback) {
        WeekRating rating = feedback.getWeekRating();
        if (rating == WeekRating.STRESSED || rating == WeekRating.NEED_HELP) {
            return true;
        }
        if (feedback.getTasksClarity() <= RISK_CLARITY_THRESHOLD) {
            return true;
        }
        if (feedback.getMentorRating() <= RISK_MENTOR_THRESHOLD) {
            return true;
        }
        List<ResourceIssue> issues = FeedbackResourceIssuesCodec.decode(feedback.getResourceIssues());
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
        return sb.toString();
    }

    private static void appendDetail(StringBuilder sb, String detail) {
        if (!sb.isEmpty()) {
            sb.append(", ");
        }
        sb.append(detail);
    }
}
