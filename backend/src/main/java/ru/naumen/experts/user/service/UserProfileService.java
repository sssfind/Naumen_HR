package ru.naumen.experts.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.notification.enums.NotificationType;
import ru.naumen.experts.notification.service.NotificationService;
import ru.naumen.experts.user.dto.UpdateProfileRequest;
import ru.naumen.experts.user.dto.UserProfileResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.mapper.UserMapper;
import ru.naumen.experts.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return UserMapper.toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setFullName(request.getFullName().trim());
        user.setDepartment(emptyToNull(request.getDepartment()));
        user.setPhone(emptyToNull(request.getPhone()));
        user.setPosition(emptyToNull(request.getPosition()));

        User saved = userRepository.save(user);

        notificationService.createNotification(
                userId,
                "Профиль обновлён",
                "Вы успешно обновили данные профиля",
                NotificationType.PROFILE_UPDATED
        );

        return UserMapper.toProfileResponse(saved);
    }

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
