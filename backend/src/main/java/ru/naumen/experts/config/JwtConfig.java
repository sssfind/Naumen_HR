package ru.naumen.experts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig {

    private String secret;
    private long expirationMs = 86_400_000L;
}
