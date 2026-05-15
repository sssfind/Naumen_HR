package ru.naumen.experts.event.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.event.dto.CreateHrEventRequest;
import ru.naumen.experts.event.dto.HrEventDetailsResponse;
import ru.naumen.experts.event.dto.HrEventInvitationResponse;
import ru.naumen.experts.event.dto.HrEventListItemResponse;
import ru.naumen.experts.event.dto.HrEventParticipantExperienceResponse;
import ru.naumen.experts.event.dto.InviteUserToEventRequest;
import ru.naumen.experts.event.dto.SaveHrEventParticipantExperienceRequest;
import ru.naumen.experts.event.service.HrEventService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/events")
@RequiredArgsConstructor
@Tag(name = "HR Events", description = "Управление HR-мероприятиями и приглашениями")
@SecurityRequirement(name = "bearerAuth")
public class HrEventController {

    private final HrEventService hrEventService;

    @PostMapping
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Создать HR-мероприятие")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Мероприятие создано"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    public ResponseEntity<HrEventListItemResponse> createEvent(
            @Valid @RequestBody CreateHrEventRequest request,
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {

        HrEventListItemResponse response = hrEventService.createEvent(
                request,
                principal.getEmail()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Получить список HR-мероприятий")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список мероприятий"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен")
    })
    public ResponseEntity<List<HrEventListItemResponse>> getEvents() {
        return ResponseEntity.ok(hrEventService.getEvents());
    }

    @GetMapping("/{eventId}")
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Получить детали HR-мероприятия")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Детали мероприятия"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен"),
            @ApiResponse(responseCode = "404", description = "Мероприятие не найдено")
    })
    public ResponseEntity<HrEventDetailsResponse> getEventDetails(@PathVariable Long eventId) {
        return ResponseEntity.ok(hrEventService.getEventDetails(eventId));
    }

    @PutMapping("/{eventId}/participants/{userId}/experience")
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Сохранить участие приглашенного пользователя в профиль")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Информация об участии сохранена"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен"),
            @ApiResponse(responseCode = "404", description = "Мероприятие или пользователь не найдены")
    })
    public ResponseEntity<HrEventParticipantExperienceResponse> saveParticipantExperience(
            @PathVariable Long eventId,
            @PathVariable Long userId,
            @Valid @RequestBody SaveHrEventParticipantExperienceRequest request) {
        return ResponseEntity.ok(hrEventService.saveParticipantExperience(eventId, userId, request));
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Удалить HR-мероприятие")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Мероприятие удалено"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен"),
            @ApiResponse(responseCode = "404", description = "Мероприятие не найдено")
    })
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        hrEventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{eventId}/invitations")
    @PreAuthorize("hasRole('HR')")
    @Operation(summary = "Пригласить пользователя на HR-мероприятие")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Пользователь приглашен"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса"),
            @ApiResponse(responseCode = "403", description = "Доступ запрещен"),
            @ApiResponse(responseCode = "404", description = "Пользователь или мероприятие не найдены"),
            @ApiResponse(responseCode = "409", description = "Пользователь уже приглашен")
    })
    public ResponseEntity<HrEventInvitationResponse> inviteUser(
            @PathVariable Long eventId,
            @Valid @RequestBody InviteUserToEventRequest request,
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {

        HrEventInvitationResponse response = hrEventService.inviteUser(eventId, request, principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
