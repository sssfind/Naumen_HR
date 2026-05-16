package ru.naumen.experts.traineeplan.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.ForbiddenException;
import ru.naumen.experts.exception.TaskNotFoundException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.traineeplan.dto.TraineePlanResponse;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskRequest;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskResponse;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskRepository;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TraineePlanService {

    private final UserRepository userRepository;
    private final TraineePlanTaskRepository taskRepository;

    @Transactional(readOnly = true)
    public TraineePlanResponse getPlanForHr(Long hrId, Long traineeId) {
        requireAssignedTrainee(hrId, traineeId);
        return buildPlan(traineeId);
    }

    @Transactional(readOnly = true)
    public TraineePlanResponse getPlanForTrainee(Long traineeId) {
        requireTrainee(traineeId);
        return buildPlan(traineeId);
    }

    @Transactional
    public TraineePlanTaskResponse createTask(Long hrId, Long traineeId, TraineePlanTaskRequest request) {
        User trainee = requireAssignedTrainee(hrId, traineeId);
        TraineePlanTask task = TraineePlanTask.builder()
                .trainee(trainee)
                .block(request.getBlock())
                .description(request.getDescription().trim())
                .deadline(request.getDeadline())
                .priority(request.getPriority())
                .acceptanceCriteria(request.getAcceptanceCriteria().trim())
                .acceptanceCheckType(request.getAcceptanceCheckType())
                .build();
        return toTaskResponse(taskRepository.save(task));
    }

    @Transactional
    public TraineePlanTaskResponse updateTask(Long hrId, Long traineeId, Long taskId, TraineePlanTaskRequest request) {
        requireAssignedTrainee(hrId, traineeId);
        TraineePlanTask task = requireTaskForTrainee(traineeId, taskId);
        task.setBlock(request.getBlock());
        task.setDescription(request.getDescription().trim());
        task.setDeadline(request.getDeadline());
        task.setPriority(request.getPriority());
        task.setAcceptanceCriteria(request.getAcceptanceCriteria().trim());
        task.setAcceptanceCheckType(request.getAcceptanceCheckType());
        return toTaskResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long hrId, Long traineeId, Long taskId) {
        requireAssignedTrainee(hrId, traineeId);
        TraineePlanTask task = requireTaskForTrainee(traineeId, taskId);
        taskRepository.delete(task);
    }

    private TraineePlanResponse buildPlan(Long traineeId) {
        Map<TraineePlanBlock, List<TraineePlanTaskResponse>> tasksByBlock = taskRepository
                .findByTraineeIdOrderByDeadlineAscIdAsc(traineeId)
                .stream()
                .map(this::toTaskResponse)
                .collect(Collectors.groupingBy(TraineePlanTaskResponse::getBlock));

        return TraineePlanResponse.builder()
                .blocks(Arrays.stream(TraineePlanBlock.values())
                        .map(block -> TraineePlanResponse.TraineePlanBlockResponse.builder()
                                .id(block.getId())
                                .title(block.getTitle())
                                .tasks(tasksByBlock.getOrDefault(block, List.of()))
                                .build())
                        .toList())
                .build();
    }

    private User requireAssignedTrainee(Long hrId, Long traineeId) {
        User trainee = requireTrainee(traineeId);
        if (trainee.getHr() == null || !trainee.getHr().getId().equals(hrId)) {
            throw new ForbiddenException("Этот стажёр не закреплён за вами");
        }
        return trainee;
    }

    private User requireTrainee(Long traineeId) {
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));
        if (trainee.getRole() != UserRole.ROLE_TRAINEE) {
            throw new ForbiddenException("Доступно только для стажёров");
        }
        return trainee;
    }

    private TraineePlanTask requireTaskForTrainee(Long traineeId, Long taskId) {
        TraineePlanTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
        if (!task.getTrainee().getId().equals(traineeId)) {
            throw new ForbiddenException("Задача не относится к этому стажёру");
        }
        return task;
    }

    private TraineePlanTaskResponse toTaskResponse(TraineePlanTask task) {
        return TraineePlanTaskResponse.builder()
                .id(task.getId())
                .block(task.getBlock())
                .blockId(task.getBlock().getId())
                .description(task.getDescription())
                .deadline(task.getDeadline())
                .priority(task.getPriority())
                .acceptanceCriteria(task.getAcceptanceCriteria())
                .acceptanceCheckType(task.getAcceptanceCheckType())
                .build();
    }
}
