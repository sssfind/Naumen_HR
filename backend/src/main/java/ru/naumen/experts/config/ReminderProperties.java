package ru.naumen.experts.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.reminders")
public class ReminderProperties {

    /** Cron: daily reminder run (default 09:00 UTC). */
    private String cron = "0 0 9 * * *";

    private boolean enabled = true;

    /** Days before deadline to send "due soon" notification. */
    private int dueSoonDays = 1;

    /** Day of week (1=Mon … 7=Sun) from which to nudge weekly feedback. */
    private int feedbackReminderFromDay = 4;
}
