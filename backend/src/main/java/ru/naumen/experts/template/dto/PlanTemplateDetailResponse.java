package ru.naumen.experts.template.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PlanTemplateDetailResponse {

    private Long id;
    private String name;
    private String description;
    private String targetPosition;
    private Integer durationWeeks;
    private boolean system;
    private List<PlanTemplateBlockResponse> blocks;

    @Data
    @Builder
    public static class PlanTemplateBlockResponse {
        private String id;
        private String title;
        private List<PlanTemplateTaskResponse> tasks;
    }
}
