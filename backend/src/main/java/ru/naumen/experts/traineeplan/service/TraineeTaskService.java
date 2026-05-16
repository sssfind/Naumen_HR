package ru.naumen.experts.traineeplan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.BadRequestException;
import ru.naumen.experts.exception.ForbiddenException;
import ru.naumen.experts.exception.TaskNotFoundException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.notification.enums.NotificationType;
import ru.naumen.experts.notification.service.NotificationService;
import ru.naumen.experts.traineeplan.dto.CreateTaskCommentRequest;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskCommentResponse;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskResponse;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.entity.TraineePlanTaskComment;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;
import ru.naumen.experts.traineeplan.mapper.TraineePlanTaskMapper;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskCommentRepository;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskRepository;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.repository.UserRepository;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TraineeTaskService {

    private final UserRepository userRepository;
    private final TraineePlanTaskRepository taskRepository;
    private final TraineePlanTaskCommentRepository commentRepository;
    private final NotificationService notificationService;

    @Transactional
    public TraineePlanTaskResponse startTask(Long traineeId, Long taskId) {
        TraineePlanTask task = requireOwnTask(traineeId, taskId);
        if (task.getStatus() != TaskStatus.NOT_STARTED) {
            throw new BadRequestException("Задачу можно взять в работу только из статуса «Не начата»");
        }
        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setStartedAt(OffsetDateTime.now());
        taskRepository.save(task);
        notifyMentor(task, "Стажёр взял задачу в работу",
                task.getTrainee().getFullName() + ": " + truncate(task.getDescription()),
                NotificationType.TASK_STARTED);
        return toResponseWithComments(task);
    }

    @Transactional
    public TraineePlanTaskResponse completeTask(Long traineeId, Long taskId) {
        TraineePlanTask task = requireOwnTask(traineeId, taskId);
        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new BadRequestException("Завершить можно только задачу, которая уже в работе");
        }
        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(OffsetDateTime.now());
        taskRepository.save(task);
        recalculateBlockProgress(task.getTrainee(), task.getBlock());
        notifyMentor(task, "Стажёр завершил задачу",
                task.getTrainee().getFullName() + ": " + truncate(task.getDescription()),
                NotificationType.TASK_COMPLETED);
        return toResponseWithComments(task);
    }

    @Transactional
    public TraineePlanTaskCommentResponse addComment(Long traineeId, Long taskId, CreateTaskCommentRequest request) {
        TraineePlanTask task = requireOwnTask(traineeId, taskId);
        User trainee = requireTrainee(traineeId);
        TraineePlanTaskComment comment = TraineePlanTaskComment.builder()
                .task(task)
                .author(trainee)
                .text(request.getText().trim())
                .build();
        comment = commentRepository.save(comment);
        notifyMentor(task, "Комментарий к задаче",
                task.getTrainee().getFullName() + ": " + truncate(request.getText()),
                NotificationType.TASK_COMMENT);
        return TraineePlanTaskMapper.toCommentResponse(comment);
    }

    public TraineePlanTaskResponse toResponseWithComments(TraineePlanTask task) {
        List<TraineePlanTaskComment> comments = commentRepository.findByTaskIdOrderByCreatedAtAsc(task.getId());
        return TraineePlanTaskMapper.toResponse(task, comments);
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

    private TraineePlanTask requireOwnTask(Long traineeId, Long taskId) {
        requireTrainee(traineeId);
        TraineePlanTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
        if (!task.getTrainee().getId().equals(traineeId)) {
            throw new ForbiddenException("Задача не относится к этому стажёру");
        }
        return task;
    }

    private User requireTrainee(Long traineeId) {
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));
        if (trainee.getRole() != UserRole.ROLE_TRAINEE) {
            throw new ForbiddenException("Доступно только для стажёров");
        }
        return trainee;
    }

    private void notifyMentor(TraineePlanTask task, String title, String message, NotificationType type) {
        User mentor = task.getTrainee().getHr();
        if (mentor != null) {
            notificationService.createNotification(mentor.getId(), title, message, type);
        }
    }

    private String truncate(String text) {
        if (text == null) {
            return "";
        }
        String trimmed = text.trim();
        return trimmed.length() <= 120 ? trimmed : trimmed.substring(0, 117) + "...";
    }
}
