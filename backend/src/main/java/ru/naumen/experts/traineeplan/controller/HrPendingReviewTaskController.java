package ru.naumen.experts.traineeplan.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.traineeplan.dto.PendingReviewTaskResponse;
import ru.naumen.experts.traineeplan.service.StaffTraineeTaskService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/tasks")
@RequiredArgsConstructor
@Tag(name = "HR Trainee Task Review", description = "Проверка задач стажёров")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('HR', 'MENTOR')")
public class HrPendingReviewTaskController {

    private final StaffTraineeTaskService staffTraineeTaskService;

    @Operation(summary = "Задачи стажёров, ожидающие проверки")
    @GetMapping("/pending-review")
    public ResponseEntity<List<PendingReviewTaskResponse>> listPendingReview(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(
                staffTraineeTaskService.listPendingReviewTasks(principal.getUserId()));
    }
}
