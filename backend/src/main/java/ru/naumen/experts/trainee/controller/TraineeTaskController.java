package ru.naumen.experts.trainee.controller;

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
import ru.naumen.experts.traineeplan.dto.CreateTaskCommentRequest;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskCommentResponse;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskResponse;
import ru.naumen.experts.traineeplan.service.TraineeTaskService;

@RestController
@RequestMapping("/api/v1/trainee/tasks")
@RequiredArgsConstructor
@Tag(name = "Trainee Tasks", description = "Работа стажёра с задачами плана")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('TRAINEE')")
public class TraineeTaskController {

    private final TraineeTaskService traineeTaskService;

    @Operation(summary = "Взять задачу в работу")
    @PostMapping("/{taskId}/start")
    public ResponseEntity<TraineePlanTaskResponse> startTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(traineeTaskService.startTask(principal.getUserId(), taskId));
    }

    @Operation(summary = "Завершить задачу")
    @PostMapping("/{taskId}/complete")
    public ResponseEntity<TraineePlanTaskResponse> completeTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(traineeTaskService.completeTask(principal.getUserId(), taskId));
    }

    @Operation(summary = "Добавить комментарий к задаче")
    @PostMapping("/{taskId}/comments")
    public ResponseEntity<TraineePlanTaskCommentResponse> addComment(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long taskId,
            @Valid @RequestBody CreateTaskCommentRequest request) {
        return ResponseEntity.ok(traineeTaskService.addComment(principal.getUserId(), taskId, request));
    }
}
