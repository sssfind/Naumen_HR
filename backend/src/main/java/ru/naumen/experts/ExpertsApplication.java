package ru.naumen.experts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import ru.naumen.experts.config.JwtConfig;

@SpringBootApplication
@EnableConfigurationProperties(JwtConfig.class)
public class ExpertsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpertsApplication.class, args);
    }
}
