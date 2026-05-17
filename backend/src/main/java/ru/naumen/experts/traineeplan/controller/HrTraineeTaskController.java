package ru.naumen.experts.traineeplan.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.traineeplan.dto.RejectTaskRequest;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskResponse;
import ru.naumen.experts.traineeplan.service.StaffTraineeTaskService;

@RestController
@RequestMapping("/api/v1/hr/trainees/{traineeId}/tasks")
@RequiredArgsConstructor
@Tag(name = "HR Trainee Task Review", description = "Проверка задач стажёра наставником и HR")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('HR', 'MENTOR')")
public class HrTraineeTaskController {

    private final StaffTraineeTaskService staffTraineeTaskService;

    @Operation(summary = "Подтвердить выполнение задачи")
    @PostMapping("/{taskId}/approve")
    public ResponseEntity<TraineePlanTaskResponse> approveTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(staffTraineeTaskService.approveTask(
                principal.getUserId(), traineeId, taskId));
    }

    @Operation(summary = "Отклонить задачу и отправить на доработку")
    @PostMapping("/{taskId}/reject")
    public ResponseEntity<TraineePlanTaskResponse> rejectTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId,
            @PathVariable Long taskId,
            @Valid @RequestBody RejectTaskRequest request) {
        return ResponseEntity.ok(staffTraineeTaskService.rejectTask(
                principal.getUserId(), traineeId, taskId, request));
    }
}
