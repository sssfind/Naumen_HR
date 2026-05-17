package ru.naumen.experts.hr.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.hr.service.HrTraineeService;
import ru.naumen.experts.user.dto.EmployeeResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/mentors")
@RequiredArgsConstructor
@Tag(name = "HR Mentors", description = "Список наставников для назначения")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('HR')")
public class HrMentorController {

    private final HrTraineeService hrTraineeService;

    @Operation(summary = "Список активных наставников")
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> listMentors() {
        return ResponseEntity.ok(hrTraineeService.listMentors());
    }
}
