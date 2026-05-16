package ru.naumen.experts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Data
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    private List<String> allowedOrigins = List.of(
            "http://localhost:3000",
            "http://localhost:5173"
    );

    /**
     * Поддержка APP_CORS_ALLOWED_ORIGINS=https://a.com,http://localhost:3000 из docker compose.
     */
    public void setAllowedOrigins(List<String> allowedOrigins) {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            this.allowedOrigins = List.of();
            return;
        }
        if (allowedOrigins.size() == 1 && allowedOrigins.getFirst().contains(",")) {
            this.allowedOrigins = Arrays.stream(allowedOrigins.getFirst().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            return;
        }
        this.allowedOrigins = allowedOrigins;
    }
}
