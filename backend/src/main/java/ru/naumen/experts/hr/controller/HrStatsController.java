package ru.naumen.experts.hr.controller;

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
import ru.naumen.experts.hr.dto.HrTeamStatsResponse;
import ru.naumen.experts.hr.service.HrTraineeService;

@RestController
@RequestMapping("/api/v1/hr/stats")
@RequiredArgsConstructor
@Tag(name = "HR Stats", description = "Сводная статистика по стажёрам HR")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('HR')")
public class HrStatsController {

    private final HrTraineeService hrTraineeService;

    @Operation(summary = "Сводка по моим стажёрам")
    @GetMapping
    public ResponseEntity<HrTeamStatsResponse> getTeamStats(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(hrTraineeService.getTeamStats(principal.getUserId()));
    }
}
