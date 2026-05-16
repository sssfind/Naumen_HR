package ru.naumen.experts.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.user.dto.PagedEmployeesResponse;
import ru.naumen.experts.user.service.EmployeeDirectoryService;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Справочник сотрудников")
@SecurityRequirement(name = "bearerAuth")
public class EmployeeController {

    private final EmployeeDirectoryService employeeDirectoryService;

    @Operation(summary = "Справочник сотрудников с поиском и фильтром по отделу")
    @GetMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<PagedEmployeesResponse> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(employeeDirectoryService.search(search, department, page, size));
    }
}
