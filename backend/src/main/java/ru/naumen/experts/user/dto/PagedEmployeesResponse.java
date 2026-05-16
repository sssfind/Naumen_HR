package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PagedEmployeesResponse {

    private List<EmployeeResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
