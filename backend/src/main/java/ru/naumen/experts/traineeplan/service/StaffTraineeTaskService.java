package ru.naumen.experts.traineeplan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.BadRequestException;
import ru.naumen.experts.exception.TaskNotFoundException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.notification.enums.NotificationType;
import ru.naumen.experts.notification.service.NotificationService;
import ru.naumen.experts.traineeplan.dto.RejectTaskRequest;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskResponse;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskRepository;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.repository.UserRepository;
import ru.naumen.experts.user.service.StaffAccessService;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class StaffTraineeTaskService {

    private final UserRepository userRepository;
    private final TraineePlanTaskRepository taskRepository;
    private final TraineeTaskService traineeTaskService;
    private final NotificationService notificationService;
    private final StaffAccessService staffAccessService;

    @Transactional
    public TraineePlanTaskResponse approveTask(Long staffId, Long traineeId, Long taskId) {
        TraineePlanTask task = requireReviewableTask(staffId, traineeId, taskId);
        if (task.getStatus() != TaskStatus.PENDING_REVIEW) {
            throw new BadRequestException("Подтвердить можно только задачу, ожидающую проверки");
        }
        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(OffsetDateTime.now());
        task.setRejectionComment(null);
        taskRepository.save(task);
        recalculateBlockProgress(task.getTrainee(), task.getBlock());

        User trainee = task.getTrainee();
        notificationService.createNotification(
                trainee.getId(),
                "Задача принята",
                "Наставник подтвердил выполнение: " + truncate(task.getDescription()),
                NotificationType.TASK_APPROVED
        );

        return traineeTaskService.toResponseWithComments(task);
    }

    @Transactional
    public TraineePlanTaskResponse rejectTask(Long staffId, Long traineeId, Long taskId, RejectTaskRequest request) {
        TraineePlanTask task = requireReviewableTask(staffId, traineeId, taskId);
        if (task.getStatus() != TaskStatus.PENDING_REVIEW) {
            throw new BadRequestException("Отклонить можно только задачу, ожидающую проверки");
        }
        String comment = request != null && request.getComment() != null
                ? request.getComment().trim()
                : null;
        if (comment != null && comment.isEmpty()) {
            comment = null;
        }

        task.setStatus(TaskStatus.REJECTED);
        task.setCompletedAt(null);
        task.setRejectionComment(comment);
        taskRepository.save(task);

        User trainee = task.getTrainee();
        String message = "Наставник отправил задачу на доработку: " + truncate(task.getDescription());
        if (comment != null) {
            message += ". Комментарий: " + truncate(comment);
        }
        notificationService.createNotification(
                trainee.getId(),
                "Задача на доработку",
                message,
                NotificationType.TASK_REJECTED
        );

        return traineeTaskService.toResponseWithComments(task);
    }

    private TraineePlanTask requireReviewableTask(Long staffId, Long traineeId, Long taskId) {
        User staff = staffAccessService.requireUser(staffId);
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));
        staffAccessService.requireCanViewTrainee(staff, trainee);

        TraineePlanTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
        if (!task.getTrainee().getId().equals(traineeId)) {
            throw new BadRequestException("Задача не относится к этому стажёру");
        }
        return task;
    }

    private void recalculateBlockProgress(User trainee, TraineePlanBlock block) {
        long total = taskRepository.countByTraineeIdAndBlock(trainee.getId(), block);
        if (total == 0) {
            return;
        }
        long completed = taskRepository.countByTraineeIdAndBlockAndStatus(
                trainee.getId(), block, TaskStatus.COMPLETED);
        int progress = (int) Math.round((completed * 100.0) / total);
        switch (block) {
            case ONBOARDING -> trainee.setProgressBlockOne(progress);
            case SKILLS -> trainee.setProgressBlockTwo(progress);
            case WORK -> trainee.setProgressBlockThree(progress);
        }
        userRepository.save(trainee);
    }

    private String truncate(String text) {
        if (text == null) {
            return "";
        }
        String trimmed = text.trim();
        return trimmed.length() <= 120 ? trimmed : trimmed.substring(0, 117) + "...";
    }
}
