package ru.naumen.experts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import ru.naumen.experts.config.AppSecurityProperties;
import ru.naumen.experts.config.CorsProperties;
import ru.naumen.experts.config.JwtConfig;

@SpringBootApplication
@EnableConfigurationProperties({JwtConfig.class, AppSecurityProperties.class, CorsProperties.class})
public class NaumenHrApplication {

    public static void main(String[] args) {
        SpringApplication.run(NaumenHrApplication.class, args);
    }
}
