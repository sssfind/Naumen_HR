package ru.naumen.experts.reminder.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.reminder.dto.ReminderSyncResponse;
import ru.naumen.experts.reminder.service.TraineeReminderService;

@RestController
@RequestMapping("/api/v1/trainee/reminders")
@RequiredArgsConstructor
@Tag(name = "Trainee Reminders", description = "Напоминания для стажёров")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('TRAINEE')")
public class TraineeReminderController {

    private final TraineeReminderService traineeReminderService;

    @Operation(summary = "Проверить и создать актуальные напоминания")
    @PostMapping("/sync")
    public ResponseEntity<ReminderSyncResponse> sync(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        int created = traineeReminderService.processTrainee(principal.getUserId());
        return ResponseEntity.ok(ReminderSyncResponse.builder().created(created).build());
    }
}
