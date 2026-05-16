package ru.naumen.experts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import ru.naumen.experts.config.AppSecurityProperties;
import ru.naumen.experts.config.CorsProperties;
import ru.naumen.experts.config.JwtConfig;
import ru.naumen.experts.config.ReminderProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({
        JwtConfig.class,
        AppSecurityProperties.class,
        CorsProperties.class,
        ReminderProperties.class
})
public class NaumenHrApplication {

    public static void main(String[] args) {
        SpringApplication.run(NaumenHrApplication.class, args);
    }
}
