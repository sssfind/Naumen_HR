package ru.naumen.experts.trainee.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.department.service.DepartmentService;
import ru.naumen.experts.exception.ForbiddenException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskResponse;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.entity.TraineePlanTaskComment;
import ru.naumen.experts.traineeplan.mapper.TraineePlanTaskMapper;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskCommentRepository;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskRepository;
import ru.naumen.experts.traineeplan.service.AdaptationPathService;
import ru.naumen.experts.user.dto.PagedTraineeEmployeesResponse;
import ru.naumen.experts.user.dto.TraineeDashboardResponse;
import ru.naumen.experts.user.dto.TraineeEmployeeResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.mapper.UserMapper;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TraineeService {

    private static final List<TraineeDashboardResponse.TaskProgressBlock> TASK_BLOCKS = List.of(
            TraineeDashboardResponse.TaskProgressBlock.builder()
                    .id("onboarding")
                    .title("Знакомство с компанией и командой")
                    .build(),
            TraineeDashboardResponse.TaskProgressBlock.builder()
                    .id("skills")
                    .title("Прокачка скиллов")
                    .build(),
            TraineeDashboardResponse.TaskProgressBlock.builder()
                    .id("work")
                    .title("Рабочие задачи")
                    .build()
    );

    private final UserRepository userRepository;
    private final TraineePlanTaskRepository taskRepository;
    private final TraineePlanTaskCommentRepository commentRepository;
    private final AdaptationPathService adaptationPathService;
    private final DepartmentService departmentService;

    @Transactional(readOnly = true)
    public TraineeDashboardResponse getDashboard(Long traineeId) {
        User trainee = requireTrainee(traineeId);
        List<TraineePlanTask> tasks = taskRepository.findByTraineeIdOrderByDeadlineAscIdAsc(traineeId);
        Map<String, List<TraineePlanTaskResponse>> tasksByBlock = mapTasksWithComments(tasks)
                .stream()
                .collect(Collectors.groupingBy(TraineePlanTaskResponse::getBlockId));

        return TraineeDashboardResponse.builder()
                .taskBlocks(List.of(
                        blockWithProgress(TASK_BLOCKS.get(0), trainee.getProgressBlockOne(), tasksByBlock),
                        blockWithProgress(TASK_BLOCKS.get(1), trainee.getProgressBlockTwo(), tasksByBlock),
                        blockWithProgress(TASK_BLOCKS.get(2), trainee.getProgressBlockThree(), tasksByBlock)
                ))
                .totalProgress(UserMapper.calculateTotalProgress(trainee))
                .adaptationPath(adaptationPathService.build(trainee, tasks))
                .build();
    }

    @Transactional(readOnly = true)
    public PagedTraineeEmployeesResponse searchEmployees(
            Long traineeId, String search, Long departmentId, int page, int size) {
        User trainee = requireTrainee(traineeId);
        String team = normalizeTeam(trainee.getTeam());
        List<Long> departmentIds = departmentService.resolveFilterDepartmentIds(departmentId);

        Pageable pageable = PageRequest.of(page, size);
        Page<User> result = userRepository.searchActiveUsersForTrainee(
                traineeId,
                team,
                normalize(search),
                departmentIds,
                pageable
        );

        List<TraineeEmployeeResponse> content = result.getContent().stream()
                .map(user -> UserMapper.toTraineeEmployeeResponse(user, team))
                .toList();

        return PagedTraineeEmployeesResponse.builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    private User requireTrainee(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        if (user.getRole() != UserRole.ROLE_TRAINEE) {
            throw new ForbiddenException("Доступно только для стажёров");
        }
        return user;
    }

    private TraineeDashboardResponse.TaskProgressBlock blockWithProgress(
            TraineeDashboardResponse.TaskProgressBlock template,
            Integer progress,
            Map<String, List<TraineePlanTaskResponse>> tasksByBlock) {
        return TraineeDashboardResponse.TaskProgressBlock.builder()
                .id(template.getId())
                .title(template.getTitle())
                .progress(safeProgress(progress))
                .tasks(tasksByBlock.getOrDefault(template.getId(), List.of()))
                .build();
    }

    private List<TraineePlanTaskResponse> mapTasksWithComments(List<TraineePlanTask> tasks) {
        if (tasks.isEmpty()) {
            return List.of();
        }
        List<Long> taskIds = tasks.stream().map(TraineePlanTask::getId).toList();
        Map<Long, List<TraineePlanTaskComment>> commentsByTask = commentRepository
                .findByTaskIdInOrderByCreatedAtAsc(taskIds)
                .stream()
                .collect(Collectors.groupingBy(c -> c.getTask().getId()));
        return tasks.stream()
                .map(task -> TraineePlanTaskMapper.toResponse(
                        task,
                        commentsByTask.getOrDefault(task.getId(), List.of())))
                .toList();
    }

    private int safeProgress(Integer value) {
        if (value == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, value));
    }

    private String normalizeTeam(String team) {
        if (team == null || team.isBlank()) {
            return null;
        }
        return team.trim();
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}
