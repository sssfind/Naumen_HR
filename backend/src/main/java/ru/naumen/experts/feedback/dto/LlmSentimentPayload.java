package ru.naumen.experts.feedback.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LlmSentimentPayload(
        String sentiment,
        Integer score,
        List<String> riskFlags,
        String summary) {
}
