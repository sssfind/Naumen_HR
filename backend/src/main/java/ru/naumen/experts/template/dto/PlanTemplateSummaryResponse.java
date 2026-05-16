package ru.naumen.experts.template.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlanTemplateSummaryResponse {

    private Long id;
    private String name;
    private String description;
    private String targetPosition;
    private Integer durationWeeks;
    private boolean system;
    private int taskCount;
}
