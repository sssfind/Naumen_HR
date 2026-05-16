package ru.naumen.experts.notification.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.notification.enums.NotificationType;

import java.time.OffsetDateTime;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private OffsetDateTime createdAt;
}
