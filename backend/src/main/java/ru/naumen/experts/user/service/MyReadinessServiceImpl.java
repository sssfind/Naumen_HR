package ru.naumen.experts.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.user.dto.AddMyReadinessRequest;
import ru.naumen.experts.user.dto.UserProfileCardResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.entity.UserReadiness;
import ru.naumen.experts.user.enums.ReadinessEventType;
import ru.naumen.experts.user.repository.UserReadinessRepository;
import ru.naumen.experts.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class MyReadinessServiceImpl implements MyReadinessService {

    private final UserRepository userRepository;
    private final UserReadinessRepository userReadinessRepository;
    private final UserService userService;

    @Override
    @Transactional
    public UserProfileCardResponse addMyReadiness(Long userId, AddMyReadinessRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        ReadinessEventType type = request.getReadinessEventType();
        if (userReadinessRepository.existsByUser_IdAndReadinessEventType(userId, type)) {
            return userService.getProfileCard(userId);
        }

        UserReadiness row = UserReadiness.builder()
                .user(user)
                .readinessEventType(type)
                .build();
        userReadinessRepository.save(row);
        return userService.getProfileCard(userId);
    }

    @Override
    @Transactional
    public void deleteMyReadiness(Long userId, ReadinessEventType readinessEventType) {
        if (!userReadinessRepository.existsByUser_IdAndReadinessEventType(userId, readinessEventType)) {
            throw new IllegalArgumentException("Готовность к формату не найдена в профиле");
        }
        userReadinessRepository.deleteByUser_IdAndReadinessEventType(userId, readinessEventType);
    }
}
