package ru.naumen.experts.hr.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.hr.service.HrTraineeService;
import ru.naumen.experts.user.dto.EmployeeResponse;
import ru.naumen.experts.user.dto.TraineeProfileResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/trainees")
@RequiredArgsConstructor
@Tag(name = "HR Trainees", description = "Стажёры HR")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('HR')")
public class HrTraineeController {

    private final HrTraineeService hrTraineeService;

    @Operation(summary = "Мои стажёры")
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getMyTrainees(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(hrTraineeService.getMyTrainees(principal.getUserId()));
    }

    @Operation(summary = "Профиль моего стажёра")
    @GetMapping("/{traineeId}")
    public ResponseEntity<TraineeProfileResponse> getTraineeProfile(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId) {
        return ResponseEntity.ok(hrTraineeService.getTraineeProfile(principal.getUserId(), traineeId));
    }

    @Operation(summary = "Назначить стажёра себе")
    @PostMapping("/{traineeId}/assign")
    public ResponseEntity<EmployeeResponse> assignTrainee(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId) {
        return ResponseEntity.ok(hrTraineeService.assignTrainee(principal.getUserId(), traineeId));
    }

    @Operation(summary = "Снять стажёра")
    @PostMapping("/{traineeId}/unassign")
    public ResponseEntity<EmployeeResponse> unassignTrainee(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId) {
        return ResponseEntity.ok(hrTraineeService.unassignTrainee(principal.getUserId(), traineeId));
    }
}
