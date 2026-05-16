package ru.naumen.experts.template.controller;

import io.swagger.v3.oas.annotations.Operation;
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
import ru.naumen.experts.template.dto.*;
import ru.naumen.experts.template.service.AdaptationPlanTemplateService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/plan-templates")
@RequiredArgsConstructor
@Tag(name = "HR Plan Templates", description = "Шаблоны планов адаптации")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('HR')")
public class HrPlanTemplateController {

    private final AdaptationPlanTemplateService templateService;

    @Operation(summary = "Список доступных шаблонов")
    @GetMapping
    public ResponseEntity<List<PlanTemplateSummaryResponse>> list(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(templateService.listForHr(principal.getUserId()));
    }

    @Operation(summary = "Шаблон с задачами")
    @GetMapping("/{templateId}")
    public ResponseEntity<PlanTemplateDetailResponse> get(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long templateId) {
        return ResponseEntity.ok(templateService.getForHr(principal.getUserId(), templateId));
    }

    @Operation(summary = "Создать пользовательский шаблон")
    @PostMapping
    public ResponseEntity<PlanTemplateDetailResponse> create(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @Valid @RequestBody PlanTemplateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(templateService.createTemplate(principal.getUserId(), request));
    }

    @Operation(summary = "Обновить пользовательский шаблон")
    @PutMapping("/{templateId}")
    public ResponseEntity<PlanTemplateDetailResponse> update(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long templateId,
            @Valid @RequestBody PlanTemplateRequest request) {
        return ResponseEntity.ok(templateService.updateTemplate(principal.getUserId(), templateId, request));
    }

    @Operation(summary = "Удалить пользовательский шаблон")
    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long templateId) {
        templateService.deleteTemplate(principal.getUserId(), templateId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Добавить задачу в пользовательский шаблон")
    @PostMapping("/{templateId}/tasks")
    public ResponseEntity<PlanTemplateTaskResponse> createTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long templateId,
            @Valid @RequestBody PlanTemplateTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(templateService.createTask(principal.getUserId(), templateId, request));
    }

    @Operation(summary = "Обновить задачу в пользовательском шаблоне")
    @PutMapping("/{templateId}/tasks/{taskId}")
    public ResponseEntity<PlanTemplateTaskResponse> updateTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long templateId,
            @PathVariable Long taskId,
            @Valid @RequestBody PlanTemplateTaskRequest request) {
        return ResponseEntity.ok(templateService.updateTask(principal.getUserId(), templateId, taskId, request));
    }

    @Operation(summary = "Удалить задачу из пользовательского шаблона")
    @DeleteMapping("/{templateId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long templateId,
            @PathVariable Long taskId) {
        templateService.deleteTask(principal.getUserId(), templateId, taskId);
        return ResponseEntity.noContent().build();
    }
}
