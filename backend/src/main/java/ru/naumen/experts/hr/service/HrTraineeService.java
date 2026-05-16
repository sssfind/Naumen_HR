package ru.naumen.experts.hr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.BadRequestException;
import ru.naumen.experts.exception.ForbiddenException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.notification.enums.NotificationType;
import ru.naumen.experts.notification.service.NotificationService;
import ru.naumen.experts.user.dto.EmployeeResponse;
import ru.naumen.experts.user.dto.TraineeProfileResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.mapper.UserMapper;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HrTraineeService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getMyTrainees(Long hrId) {
        return userRepository.findByHrIdAndRoleAndIsActiveTrue(hrId, UserRole.ROLE_TRAINEE)
                .stream()
                .map(UserMapper::toEmployeeResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TraineeProfileResponse getTraineeProfile(Long hrId, Long traineeId) {
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));

        if (trainee.getHr() == null || !trainee.getHr().getId().equals(hrId)) {
            throw new ForbiddenException("Этот стажёр не закреплён за вами");
        }

        return UserMapper.toTraineeProfileResponse(trainee);
    }

    @Transactional
    public EmployeeResponse assignTrainee(Long hrId, Long traineeId) {
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new UserNotFoundException(hrId));
        if (hr.getRole() != UserRole.ROLE_HR) {
            throw new ForbiddenException("Только HR может назначать стажёров");
        }

        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));

        if (!Boolean.TRUE.equals(trainee.getIsActive())) {
            throw new BadRequestException("Нельзя назначить неактивного пользователя");
        }

        if (trainee.getRole() == UserRole.ROLE_HR) {
            throw new BadRequestException("Нельзя назначить HR в качестве стажёра");
        }

        trainee.setRole(UserRole.ROLE_TRAINEE);
        trainee.setHr(hr);
        User saved = userRepository.save(trainee);

        notificationService.createNotification(
                hrId,
                "Стажёр назначен",
                "Вам назначен стажёр: " + saved.getFullName(),
                NotificationType.TRAINEE_ASSIGNED
        );

        if (!hrId.equals(traineeId)) {
            notificationService.createNotification(
                    trainee.getId(),
                    "Назначен HR-куратор",
                    "Ваш куратор: " + hr.getFullName(),
                    NotificationType.TRAINEE_ASSIGNED
            );
        }

        return UserMapper.toEmployeeResponse(saved);
    }

    @Transactional
    public EmployeeResponse unassignTrainee(Long hrId, Long traineeId) {
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));

        if (trainee.getHr() == null || !trainee.getHr().getId().equals(hrId)) {
            throw new ForbiddenException("Этот стажёр не закреплён за вами");
        }

        trainee.setHr(null);
        User saved = userRepository.save(trainee);

        notificationService.createNotification(
                hrId,
                "Стажёр снят",
                "Стажёр " + saved.getFullName() + " больше не закреплён за вами",
                NotificationType.TRAINEE_UNASSIGNED
        );

        return UserMapper.toEmployeeResponse(saved);
    }
}
