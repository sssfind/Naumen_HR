package ru.naumen.experts.feedback.service;

import ru.naumen.experts.feedback.enums.CommentRiskFlag;
import ru.naumen.experts.feedback.enums.CommentSentiment;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Fallback-анализ комментария по ключевым словам (без LLM).
 */
public final class CommentKeywordRiskAnalyzer {

    private static final List<String> STRESS_KEYWORDS = List.of(
            "стресс", "выгоран", "перегруз", "тяжел", "тяжёл", "не справ", "устал", "паник");
    private static final List<String> CLARITY_KEYWORDS = List.of(
            "не понима", "непонят", "неясн", "запутан", "не знаю что делать", "нет целей");
    private static final List<String> ENGAGEMENT_KEYWORDS = List.of(
            "скучно", "демотив", "не вовлеч", "одинок", "брошен", "не нужен", "увольн", "уйти");
    private static final List<String> ACCESS_KEYWORDS = List.of(
            "нет доступ", "не выдали", "не работает", "сломал", "не могу войти", "пропуск");

    private CommentKeywordRiskAnalyzer() {
    }

    public record KeywordAnalysis(
            CommentSentiment sentiment,
            List<CommentRiskFlag> riskFlags,
            String summary) {
    }

    public static KeywordAnalysis analyze(String comment) {
        if (comment == null || comment.isBlank()) {
            return null;
        }
        String lower = comment.toLowerCase(Locale.ROOT);
        Set<CommentRiskFlag> flags = new LinkedHashSet<>();

        if (containsAny(lower, STRESS_KEYWORDS)) {
            flags.add(CommentRiskFlag.STRESS);
        }
        if (containsAny(lower, CLARITY_KEYWORDS)) {
            flags.add(CommentRiskFlag.UNCLEAR_TASKS);
        }
        if (containsAny(lower, ENGAGEMENT_KEYWORDS)) {
            flags.add(CommentRiskFlag.LOW_ENGAGEMENT);
        }
        if (containsAny(lower, ACCESS_KEYWORDS)) {
            flags.add(CommentRiskFlag.ACCESS_ISSUES);
        }

        CommentSentiment sentiment;
        if (flags.isEmpty()) {
            sentiment = looksPositive(lower) ? CommentSentiment.POSITIVE : CommentSentiment.NEUTRAL;
        } else if (flags.size() >= 2) {
            sentiment = CommentSentiment.NEGATIVE;
        } else {
            sentiment = CommentSentiment.MIXED;
        }

        String summary = buildSummary(flags, sentiment);
        return new KeywordAnalysis(sentiment, new ArrayList<>(flags), summary);
    }

    private static boolean containsAny(String text, List<String> keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private static boolean looksPositive(String lower) {
        return lower.contains("спасиб")
                || lower.contains("отличн")
                || lower.contains("классн")
                || lower.contains("нравится")
                || lower.contains("доволен");
    }

    private static String buildSummary(Set<CommentRiskFlag> flags, CommentSentiment sentiment) {
        if (flags.isEmpty()) {
            return sentiment == CommentSentiment.POSITIVE
                    ? "В комментарии позитивный тон"
                    : "Явных рисков в комментарии не обнаружено";
        }
        List<String> parts = new ArrayList<>();
        for (CommentRiskFlag flag : flags) {
            parts.add(switch (flag) {
                case STRESS -> "признаки стресса";
                case UNCLEAR_TASKS -> "непонятность задач";
                case LOW_ENGAGEMENT -> "низкая вовлечённость";
                case ACCESS_ISSUES -> "проблемы с доступами";
            });
        }
        return "В комментарии: " + String.join(", ", parts);
    }
}
