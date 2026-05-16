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
import ru.naumen.experts.traineeplan.dto.TraineePlanResponse;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskRequest;
import ru.naumen.experts.traineeplan.dto.TraineePlanTaskResponse;
import ru.naumen.experts.template.dto.ApplyPlanTemplateRequest;
import ru.naumen.experts.template.dto.ApplyPlanTemplateResponse;
import ru.naumen.experts.template.service.AdaptationPlanTemplateService;
import ru.naumen.experts.traineeplan.service.TraineePlanService;

@RestController
@RequestMapping("/api/v1/hr/trainees/{traineeId}/plan")
@RequiredArgsConstructor
@Tag(name = "HR Trainee Plan", description = "Редактирование плана стажёра")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('HR')")
public class HrTraineePlanController {

    private final TraineePlanService traineePlanService;
    private final AdaptationPlanTemplateService adaptationPlanTemplateService;

    @Operation(summary = "План стажёра")
    @GetMapping
    public ResponseEntity<TraineePlanResponse> getPlan(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId) {
        return ResponseEntity.ok(traineePlanService.getPlanForHr(principal.getUserId(), traineeId));
    }

    @Operation(summary = "Создать задачу в плане стажёра")
    @PostMapping("/tasks")
    public ResponseEntity<TraineePlanTaskResponse> createTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId,
            @Valid @RequestBody TraineePlanTaskRequest request) {
        return ResponseEntity.ok(traineePlanService.createTask(principal.getUserId(), traineeId, request));
    }

    @Operation(summary = "Обновить задачу в плане стажёра")
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TraineePlanTaskResponse> updateTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId,
            @PathVariable Long taskId,
            @Valid @RequestBody TraineePlanTaskRequest request) {
        return ResponseEntity.ok(traineePlanService.updateTask(principal.getUserId(), traineeId, taskId, request));
    }

    @Operation(summary = "Удалить задачу из плана стажёра")
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId,
            @PathVariable Long taskId) {
        traineePlanService.deleteTask(principal.getUserId(), traineeId, taskId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Применить шаблон плана к стажёру")
    @PostMapping("/apply-template/{templateId}")
    public ResponseEntity<ApplyPlanTemplateResponse> applyTemplate(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId,
            @PathVariable Long templateId,
            @RequestBody(required = false) ApplyPlanTemplateRequest request) {
        ApplyPlanTemplateRequest body = request != null ? request : new ApplyPlanTemplateRequest();
        return ResponseEntity.ok(adaptationPlanTemplateService.applyToTrainee(
                principal.getUserId(), traineeId, templateId, body));
    }
}
