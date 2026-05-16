package ru.naumen.experts.notification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.notification.dto.NotificationResponse;
import ru.naumen.experts.notification.dto.UnreadCountResponse;
import ru.naumen.experts.notification.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Уведомления")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Список уведомлений")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(notificationService.getRecent(principal.getUserId(), limit));
    }

    @Operation(summary = "Количество непрочитанных")
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(notificationService.getUnreadCount(principal.getUserId()));
    }

    @Operation(summary = "Отметить уведомление прочитанным")
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long id) {
        notificationService.markAsRead(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Отметить все прочитанными")
    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        notificationService.markAllAsRead(principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
