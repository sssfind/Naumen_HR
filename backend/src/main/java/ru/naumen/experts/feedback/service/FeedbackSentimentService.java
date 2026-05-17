package ru.naumen.experts.feedback.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import ru.naumen.experts.chat.config.OpenRouterProperties;
import ru.naumen.experts.chat.dto.OpenRouterChatRequest;
import ru.naumen.experts.chat.dto.OpenRouterChatResponse;
import ru.naumen.experts.feedback.dto.LlmSentimentPayload;
import ru.naumen.experts.feedback.dto.SubmitFeedbackRequest;
import ru.naumen.experts.feedback.entity.FeedbackResponse;
import ru.naumen.experts.feedback.enums.CommentRiskFlag;
import ru.naumen.experts.feedback.enums.CommentSentiment;
import ru.naumen.experts.feedback.enums.SentimentLabel;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackSentimentService {

    private static final String SYSTEM_PROMPT = """
            Ты HR-аналитик адаптации новых сотрудников.
            Проанализируй комментарий стажёра к еженедельному опросу.
            Верни ТОЛЬКО валидный JSON без markdown и пояснений:
            {
              "sentiment": "POSITIVE|NEUTRAL|NEGATIVE|MIXED",
              "score": 0-100,
              "riskFlags": ["STRESS","UNCLEAR_TASKS","LOW_ENGAGEMENT","ACCESS_ISSUES"],
              "summary": "краткое резюме для HR на русском, 1-2 предложения"
            }
            riskFlags — только подходящие значения из списка, иначе пустой массив.
            """;

    private static final Pattern JSON_BLOCK = Pattern.compile("\\{.*}", Pattern.DOTALL);

    private final RestClient openRouterRestClient;
    private final OpenRouterProperties openRouterProperties;
    private final ObjectMapper objectMapper;

    /**
     * Заполняет sentiment_score/label и при наличии комментария — анализ текста.
     */
    public void enrich(FeedbackResponse entity, SubmitFeedbackRequest request) {
        FeedbackStructuredSentimentCalculator.StructuredSentiment structured =
                FeedbackStructuredSentimentCalculator.calculate(request);
        entity.setSentimentScore(structured.score());
        entity.setSentimentLabel(structured.label());

        String comment = entity.getWeekComment();
        if (comment == null || comment.isBlank()) {
            return;
        }

        CommentAnalysis analysis = analyzeComment(comment, request);
        entity.setCommentSentiment(analysis.sentiment());
        entity.setCommentRiskFlags(CommentRiskFlagsCodec.encode(analysis.riskFlags()));
        entity.setCommentSummary(analysis.summary());
        entity.setCommentAnalyzedAt(OffsetDateTime.now());

        entity.setSentimentLabel(mergeLabel(entity.getSentimentLabel(), analysis));
        if (analysis.scoreOverride() != null) {
            entity.setSentimentScore(blendScore(entity.getSentimentScore(), analysis.scoreOverride()));
        }
    }

    private CommentAnalysis analyzeComment(String comment, SubmitFeedbackRequest request) {
        if (isLlmAvailable()) {
            try {
                CommentAnalysis llm = analyzeWithLlm(comment, request);
                if (llm != null) {
                    return llm;
                }
            } catch (Exception ex) {
                log.warn("LLM sentiment analysis failed, using keyword fallback", ex);
            }
        }
        CommentKeywordRiskAnalyzer.KeywordAnalysis keyword = CommentKeywordRiskAnalyzer.analyze(comment);
        if (keyword == null) {
            return new CommentAnalysis(CommentSentiment.NEUTRAL, List.of(), "Комментарий без анализа", null);
        }
        return new CommentAnalysis(
                keyword.sentiment(),
                keyword.riskFlags(),
                keyword.summary(),
                null);
    }

    private boolean isLlmAvailable() {
        String key = openRouterProperties.apiKey();
        String model = openRouterProperties.model();
        return key != null && !key.isBlank() && model != null && !model.isBlank();
    }

    private CommentAnalysis analyzeWithLlm(String comment, SubmitFeedbackRequest request) {
        String userPrompt = """
                Оценка недели: %s
                Понятность задач (1-5): %d
                Оценка наставника (1-5): %d
                Проблемы с ресурсами: %s

                Комментарий стажёра:
                %s
                """.formatted(
                request.getWeekRating(),
                request.getTasksClarity(),
                request.getMentorRating(),
                request.getResourceIssues(),
                comment);

        OpenRouterChatRequest chatRequest = new OpenRouterChatRequest(
                openRouterProperties.model(),
                List.of(
                        new OpenRouterChatRequest.Message("system", SYSTEM_PROMPT),
                        new OpenRouterChatRequest.Message("user", userPrompt)
                ),
                0.1,
                350
        );

        OpenRouterChatResponse response = openRouterRestClient.post()
                .uri("/chat/completions")
                .body(chatRequest)
                .retrieve()
                .body(OpenRouterChatResponse.class);

        String raw = extractReply(response);
        LlmSentimentPayload payload = parsePayload(raw);
        if (payload == null) {
            return null;
        }

        CommentSentiment sentiment = parseSentiment(payload.sentiment());
        List<CommentRiskFlag> flags = parseRiskFlags(payload.riskFlags());
        String summary = payload.summary() != null && !payload.summary().isBlank()
                ? payload.summary().trim()
                : "Анализ комментария выполнен";

        Integer scoreOverride = payload.score() != null
                ? Math.clamp(payload.score(), 0, 100)
                : null;

        return new CommentAnalysis(sentiment, flags, summary, scoreOverride);
    }

    private String extractReply(OpenRouterChatResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new IllegalStateException("Empty OpenRouter response");
        }
        OpenRouterChatResponse.Message message = response.choices().get(0).message();
        if (message == null || message.content() == null || message.content().isBlank()) {
            throw new IllegalStateException("Empty OpenRouter message");
        }
        return message.content().trim();
    }

    private LlmSentimentPayload parsePayload(String raw) {
        try {
            return objectMapper.readValue(raw, LlmSentimentPayload.class);
        } catch (Exception ignored) {
            Matcher matcher = JSON_BLOCK.matcher(raw);
            if (matcher.find()) {
                try {
                    return objectMapper.readValue(matcher.group(), LlmSentimentPayload.class);
                } catch (Exception ex) {
                    log.debug("Failed to parse LLM JSON from block: {}", ex.getMessage());
                }
            }
        }
        return null;
    }

    private CommentSentiment parseSentiment(String value) {
        if (value == null || value.isBlank()) {
            return CommentSentiment.NEUTRAL;
        }
        try {
            return CommentSentiment.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return CommentSentiment.NEUTRAL;
        }
    }

    private List<CommentRiskFlag> parseRiskFlags(List<String> raw) {
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        List<CommentRiskFlag> flags = new ArrayList<>();
        for (String item : raw) {
            if (item == null || item.isBlank()) {
                continue;
            }
            try {
                flags.add(CommentRiskFlag.valueOf(item.trim().toUpperCase(Locale.ROOT)));
            } catch (IllegalArgumentException ignored) {
                // skip unknown
            }
        }
        return flags;
    }

    private SentimentLabel mergeLabel(SentimentLabel structured, CommentAnalysis analysis) {
        if (structured == SentimentLabel.AT_RISK) {
            return SentimentLabel.AT_RISK;
        }
        if (analysis.sentiment() == CommentSentiment.NEGATIVE || !analysis.riskFlags().isEmpty()) {
            return SentimentLabel.AT_RISK;
        }
        if (analysis.sentiment() == CommentSentiment.MIXED && structured == SentimentLabel.POSITIVE) {
            return SentimentLabel.NEUTRAL;
        }
        return structured;
    }

    private int blendScore(int structuredScore, int commentScore) {
        return (int) Math.round(structuredScore * 0.65 + commentScore * 0.35);
    }

    private record CommentAnalysis(
            CommentSentiment sentiment,
            List<CommentRiskFlag> riskFlags,
            String summary,
            Integer scoreOverride) {
    }
}
