package ru.naumen.experts.template.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplyPlanTemplateResponse {

    private Long templateId;
    private String templateName;
    private int tasksCreated;
}
