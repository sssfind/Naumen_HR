package ru.naumen.experts.trainee.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.ForbiddenException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.user.dto.PagedTraineeEmployeesResponse;
import ru.naumen.experts.user.dto.TraineeDashboardResponse;
import ru.naumen.experts.user.dto.TraineeEmployeeResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.mapper.UserMapper;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TraineeService {

    private static final List<TraineeDashboardResponse.TaskProgressBlock> TASK_BLOCKS = List.of(
            TraineeDashboardResponse.TaskProgressBlock.builder()
                    .id("onboarding")
                    .title("Знакомство с компанией")
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

    @Transactional(readOnly = true)
    public TraineeDashboardResponse getDashboard(Long traineeId) {
        User trainee = requireTrainee(traineeId);
        return TraineeDashboardResponse.builder()
                .taskBlocks(List.of(
                        blockWithProgress(TASK_BLOCKS.get(0), trainee.getProgressBlockOne()),
                        blockWithProgress(TASK_BLOCKS.get(1), trainee.getProgressBlockTwo()),
                        blockWithProgress(TASK_BLOCKS.get(2), trainee.getProgressBlockThree())
                ))
                .totalProgress(UserMapper.calculateTotalProgress(trainee))
                .build();
    }

    @Transactional(readOnly = true)
    public PagedTraineeEmployeesResponse searchEmployees(Long traineeId, String search, int page, int size) {
        User trainee = requireTrainee(traineeId);
        String team = normalizeTeam(trainee.getTeam());

        Pageable pageable = PageRequest.of(page, size);
        Page<User> result = userRepository.searchActiveUsersForTrainee(
                traineeId,
                team,
                normalize(search),
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
            Integer progress) {
        return TraineeDashboardResponse.TaskProgressBlock.builder()
                .id(template.getId())
                .title(template.getTitle())
                .progress(safeProgress(progress))
                .build();
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
