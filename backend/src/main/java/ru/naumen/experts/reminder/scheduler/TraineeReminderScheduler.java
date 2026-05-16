package ru.naumen.experts.reminder.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ru.naumen.experts.reminder.service.TraineeReminderService;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.reminders.enabled", havingValue = "true", matchIfMissing = true)
public class TraineeReminderScheduler {

    private final TraineeReminderService traineeReminderService;

    @Scheduled(cron = "${app.reminders.cron:0 0 9 * * *}")
    public void sendDailyReminders() {
        log.debug("Running trainee reminder job");
        traineeReminderService.processAllTrainees();
    }
}
