package ru.naumen.experts.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.notification.dto.NotificationResponse;
import ru.naumen.experts.notification.dto.UnreadCountResponse;
import ru.naumen.experts.notification.entity.Notification;
import ru.naumen.experts.notification.enums.NotificationType;
import ru.naumen.experts.notification.repository.NotificationRepository;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecent(Long userId, int limit) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return UnreadCountResponse.builder().count(count).build();
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new UserNotFoundException(notificationId));
        notification.setIsRead(true);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void createNotification(Long userId, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(Boolean.TRUE.equals(notification.getIsRead()))
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
