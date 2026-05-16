package ru.naumen.experts.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.security")
public class AppSecurityProperties {

    private String allowedEmailDomain = "naumen.ru";
}
