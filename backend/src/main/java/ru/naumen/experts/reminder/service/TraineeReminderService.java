package ru.naumen.experts.reminder.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.feedback.repository.FeedbackResponseRepository;
import ru.naumen.experts.notification.enums.NotificationType;
import ru.naumen.experts.notification.service.NotificationService;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskRepository;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.repository.UserRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.IsoFields;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TraineeReminderService {

    private final UserRepository userRepository;
    private final TraineePlanTaskRepository taskRepository;
    private final FeedbackResponseRepository feedbackRepository;
    private final NotificationService notificationService;

    @Transactional
    public int processAllTrainees() {
        List<User> trainees = userRepository.findByRoleAndIsActiveTrue(UserRole.ROLE_TRAINEE);
        int created = 0;
        for (User trainee : trainees) {
            created += processTrainee(trainee.getId());
        }
        if (created > 0) {
            log.info("Trainee reminders: {} new notifications", created);
        }
        return created;
    }

    @Transactional
    public int processTrainee(Long traineeId) {
        User trainee = userRepository.findById(traineeId).orElse(null);
        if (trainee == null || trainee.getRole() != UserRole.ROLE_TRAINEE || !Boolean.TRUE.equals(trainee.getIsActive())) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        int created = 0;
        created += remindTasksDueSoon(trainee, today);
        created += remindOverdueTasks(trainee, today);
        created += remindNextStep(trainee);
        created += remindWeeklyFeedback(trainee, today);
        return created;
    }

    private int remindTasksDueSoon(User trainee, LocalDate today) {
        LocalDate tomorrow = today.plusDays(1);
        int created = 0;
        for (TraineePlanTask task : taskRepository.findIncompleteByTraineeAndDeadline(trainee.getId(), tomorrow)) {
            String dedupKey = "task-due-soon:" + task.getId() + ":" + tomorrow;
            boolean added = notificationService.createNotificationIfAbsent(
                    trainee.getId(),
                    "Завтра дедлайн по задаче",
                    shorten(task.getDescription()) + " — срок выполнения " + formatDate(tomorrow) + ".",
                    NotificationType.TASK_DUE_SOON,
                    dedupKey);
            if (added) {
                created++;
            }
        }
        return created;
    }

    private int remindOverdueTasks(User trainee, LocalDate today) {
        int created = 0;
        String weekKey = today.get(IsoFields.WEEK_BASED_YEAR) + "-W" + today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        for (TraineePlanTask task : taskRepository.findOverdueIncompleteByTrainee(trainee.getId(), today)) {
            String dedupKey = "task-overdue:" + task.getId() + ":" + weekKey;
            boolean added = notificationService.createNotificationIfAbsent(
                    trainee.getId(),
                    "Просрочена задача",
                    shorten(task.getDescription()) + " — дедлайн был " + formatDate(task.getDeadline()) + ".",
                    NotificationType.TASK_OVERDUE,
                    dedupKey);
            if (added) {
                created++;
            }
        }
        return created;
    }

    private int remindNextStep(User trainee) {
        List<TraineePlanTask> inProgress = taskRepository.findInProgressByTrainee(trainee.getId());
        TraineePlanTask target;
        if (!inProgress.isEmpty()) {
            target = inProgress.getFirst();
        } else {
            List<TraineePlanTask> notStarted = taskRepository.findNotStartedByTrainee(trainee.getId());
            if (notStarted.isEmpty()) {
                return 0;
            }
            target = notStarted.getFirst();
        }

        LocalDate today = LocalDate.now();
        String dedupKey = "next-step:" + target.getId() + ":" + today;
        String title = target.getStatus() == TaskStatus.IN_PROGRESS
                ? "Продолжите текущую задачу"
                : "Следующий шаг в плане адаптации";
        String message = shorten(target.getDescription())
                + " — дедлайн " + formatDate(target.getDeadline()) + ".";

        return notificationService.createNotificationIfAbsent(
                trainee.getId(), title, message, NotificationType.NEXT_STEP_REMINDER, dedupKey)
                ? 1
                : 0;
    }

    private int remindWeeklyFeedback(User trainee, LocalDate today) {
        if (today.getDayOfWeek().getValue() < DayOfWeek.THURSDAY.getValue()) {
            return 0;
        }

        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        if (feedbackRepository.findByTraineeIdAndWeekStart(trainee.getId(), weekStart).isPresent()) {
            return 0;
        }

        String dedupKey = "feedback-due:" + weekStart;
        boolean added = notificationService.createNotificationIfAbsent(
                trainee.getId(),
                "Заполните еженедельный опрос",
                "Поделитесь настроением и обратной связью за неделю — это займёт 1–2 минуты.",
                NotificationType.FEEDBACK_DUE,
                dedupKey);
        return added ? 1 : 0;
    }

    private static String shorten(String text) {
        if (text == null || text.isBlank()) {
            return "Задача";
        }
        String trimmed = text.trim();
        return trimmed.length() > 80 ? trimmed.substring(0, 77) + "…" : trimmed;
    }

    private static String formatDate(LocalDate date) {
        return date.toString();
    }
}
