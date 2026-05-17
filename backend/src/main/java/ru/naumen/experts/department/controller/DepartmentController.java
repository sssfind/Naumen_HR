package ru.naumen.experts.department.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.department.dto.DepartmentDto;
import ru.naumen.experts.department.dto.DepartmentTreeNodeDto;
import ru.naumen.experts.department.service.DepartmentService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Организационная структура")
@SecurityRequirement(name = "bearerAuth")
public class DepartmentController {

    private final DepartmentService departmentService;

    @Operation(summary = "Дерево отделов и команд")
    @GetMapping("/tree")
    @PreAuthorize("hasAnyRole('HR', 'MENTOR', 'TRAINEE')")
    public ResponseEntity<List<DepartmentTreeNodeDto>> getTree() {
        return ResponseEntity.ok(departmentService.getTree());
    }

    @Operation(summary = "Плоский список отделов (без корневых групп)")
    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'MENTOR', 'TRAINEE')")
    public ResponseEntity<List<DepartmentDto>> list() {
        return ResponseEntity.ok(departmentService.listFlat());
    }
}
