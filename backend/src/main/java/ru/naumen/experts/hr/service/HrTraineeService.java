package ru.naumen.experts.hr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.BadRequestException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.hr.dto.HrTeamStatsResponse;
import ru.naumen.experts.hr.dto.TraineeTaskProgressItem;
import ru.naumen.experts.notification.enums.NotificationType;
import ru.naumen.experts.notification.service.NotificationService;
import ru.naumen.experts.trainee.service.TraineeService;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskRepository;
import ru.naumen.experts.user.dto.EmployeeResponse;
import ru.naumen.experts.user.dto.TraineeDashboardResponse;
import ru.naumen.experts.user.dto.TraineeProfileResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.mapper.UserMapper;
import ru.naumen.experts.user.repository.UserRepository;
import ru.naumen.experts.user.service.StaffAccessService;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HrTraineeService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TraineeService traineeService;
    private final TraineePlanTaskRepository traineePlanTaskRepository;
    private final StaffAccessService staffAccessService;

    @Transactional(readOnly = true)
    public List<EmployeeResponse> listMentors() {
        return userRepository.findByRoleAndIsActiveTrue(UserRole.ROLE_MENTOR)
                .stream()
                .map(UserMapper::toEmployeeResponse)
                .sorted(Comparator.comparing(EmployeeResponse::getFullName))
                .toList();
    }

    @Transactional(readOnly = true)
    public HrTeamStatsResponse getTeamStats(Long staffId) {
        List<User> trainees = traineesVisibleTo(staffId);
        int traineeCount = trainees.size();

        if (traineeCount == 0) {
            return HrTeamStatsResponse.builder()
                    .traineeCount(0)
                    .averageMoodLevel(null)
                    .averageTaskCompletionPercent(0)
                    .traineeProgress(List.of())
                    .build();
        }

        double averageMood = trainees.stream()
                .mapToInt(user -> user.getMoodLevel() != null ? user.getMoodLevel() : 3)
                .average()
                .orElse(0);

        List<Long> traineeIds = trainees.stream().map(User::getId).toList();
        long totalTasks = traineePlanTaskRepository.countByTraineeIdIn(traineeIds);
        long completedTasks = traineePlanTaskRepository.countByTraineeIdInAndStatus(
                traineeIds, TaskStatus.COMPLETED);
        int averageTaskCompletionPercent = totalTasks == 0
                ? 0
                : (int) Math.round(completedTasks * 100.0 / totalTasks);

        List<TraineeTaskProgressItem> traineeProgress = trainees.stream()
                .map(this::toTraineeTaskProgressItem)
                .sorted(Comparator.comparing(TraineeTaskProgressItem::getFullName))
                .toList();

        return HrTeamStatsResponse.builder()
                .traineeCount(traineeCount)
                .averageMoodLevel(Math.round(averageMood * 10.0) / 10.0)
                .averageTaskCompletionPercent(averageTaskCompletionPercent)
                .traineeProgress(traineeProgress)
                .build();
    }

    private TraineeTaskProgressItem toTraineeTaskProgressItem(User trainee) {
        long total = traineePlanTaskRepository.countByTraineeId(trainee.getId());
        long completed = traineePlanTaskRepository.countByTraineeIdAndStatus(
                trainee.getId(), TaskStatus.COMPLETED);
        int completionPercent = total == 0 ? 0 : (int) Math.round(completed * 100.0 / total);
        return TraineeTaskProgressItem.builder()
                .traineeId(trainee.getId())
                .fullName(trainee.getFullName())
                .totalTasks((int) total)
                .completedTasks((int) completed)
                .completionPercent(completionPercent)
                .build();
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getMyTrainees(Long staffId) {
        return traineesVisibleTo(staffId)
                .stream()
                .map(UserMapper::toEmployeeResponse)
                .toList();
    }

    private List<User> traineesVisibleTo(Long staffId) {
        User staff = staffAccessService.requireUser(staffId);
        staffAccessService.requireHrOrMentor(staff);
        if (staffAccessService.isHr(staff)) {
            return userRepository.findByHrIdAndRoleAndIsActiveTrue(staffId, UserRole.ROLE_TRAINEE);
        }
        return userRepository.findByMentorIdAndRoleAndIsActiveTrue(staffId, UserRole.ROLE_TRAINEE);
    }

    @Transactional(readOnly = true)
    public TraineeProfileResponse getTraineeProfile(Long staffId, Long traineeId) {
        User staff = staffAccessService.requireUser(staffId);
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));
        staffAccessService.requireCanViewTrainee(staff, trainee);
        return UserMapper.toTraineeProfileResponse(trainee);
    }

    @Transactional(readOnly = true)
    public TraineeDashboardResponse getTraineeDashboard(Long staffId, Long traineeId) {
        User staff = staffAccessService.requireUser(staffId);
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));
        staffAccessService.requireCanViewTrainee(staff, trainee);
        return traineeService.getDashboard(traineeId);
    }

    @Transactional
    public EmployeeResponse assignTrainee(Long hrId, Long traineeId) {
        User hr = staffAccessService.requireUser(hrId);
        staffAccessService.requireHr(hr);

        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));

        if (!Boolean.TRUE.equals(trainee.getIsActive())) {
            throw new BadRequestException("Нельзя назначить неактивного пользователя");
        }

        if (trainee.getRole() == UserRole.ROLE_HR || trainee.getRole() == UserRole.ROLE_MENTOR) {
            throw new BadRequestException("Нельзя назначить этого пользователя стажёром");
        }

        trainee.setRole(UserRole.ROLE_TRAINEE);
        trainee.setHr(hr);
        User saved = userRepository.save(trainee);

        notificationService.createNotification(
                trainee.getId(),
                "Вы в программе адаптации",
                "HR включил вас в программу адаптации. Наставник будет назначен отдельно.",
                NotificationType.TRAINEE_ASSIGNED
        );

        return UserMapper.toEmployeeResponse(saved);
    }

    @Transactional
    public EmployeeResponse assignMentor(Long hrId, Long traineeId, Long mentorId) {
        User hr = staffAccessService.requireUser(hrId);
        staffAccessService.requireHr(hr);

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new UserNotFoundException(mentorId));
        if (mentor.getRole() != UserRole.ROLE_MENTOR) {
            throw new BadRequestException("Выбранный пользователь не является наставником");
        }
        if (!Boolean.TRUE.equals(mentor.getIsActive())) {
            throw new BadRequestException("Нельзя назначить неактивного наставника");
        }

        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));
        if (trainee.getRole() != UserRole.ROLE_TRAINEE) {
            throw new BadRequestException("Пользователь не является стажёром");
        }

        trainee.setMentor(mentor);
        User saved = userRepository.save(trainee);

        notificationService.createNotification(
                trainee.getId(),
                "Назначен наставник",
                "Ваш наставник: " + mentor.getFullName(),
                NotificationType.TRAINEE_ASSIGNED
        );
        notificationService.createNotification(
                mentor.getId(),
                "Новый стажёр",
                "За вами закреплён стажёр: " + trainee.getFullName(),
                NotificationType.TRAINEE_ASSIGNED
        );

        return UserMapper.toEmployeeResponse(saved);
    }

    @Transactional
    public EmployeeResponse unassignTrainee(Long hrId, Long traineeId) {
        User hr = staffAccessService.requireUser(hrId);
        staffAccessService.requireHr(hr);

        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));

        trainee.setMentor(null);
        User saved = userRepository.save(trainee);

        return UserMapper.toEmployeeResponse(saved);
    }
}
