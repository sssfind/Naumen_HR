package ru.naumen.experts.department.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DepartmentTreeNodeDto {

    private Long id;
    private String name;
    private String description;
    private int employeeCount;
    private List<DepartmentTreeNodeDto> children;
}
