package ru.naumen.experts.chat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.open-router")
public record OpenRouterProperties(
        String apiKey,
        String baseUrl,
        String model
) {
}
