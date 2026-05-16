package ru.naumen.experts.trainee.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.trainee.service.TraineeService;
import ru.naumen.experts.user.dto.PagedTraineeEmployeesResponse;
import ru.naumen.experts.user.dto.TraineeDashboardResponse;

@RestController
@RequestMapping("/api/v1/trainee")
@RequiredArgsConstructor
@Tag(name = "Trainee", description = "Кабинет стажёра")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('TRAINEE')")
public class TraineeController {

    private final TraineeService traineeService;

    @Operation(summary = "Главная страница стажёра — блоки задач и прогресс")
    @GetMapping("/dashboard")
    public ResponseEntity<TraineeDashboardResponse> getDashboard(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(traineeService.getDashboard(principal.getUserId()));
    }

    @Operation(summary = "Справочник сотрудников (сначала команда стажёра)")
    @GetMapping("/employees")
    public ResponseEntity<PagedTraineeEmployeesResponse> searchEmployees(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(traineeService.searchEmployees(principal.getUserId(), search, page, size));
    }
}
