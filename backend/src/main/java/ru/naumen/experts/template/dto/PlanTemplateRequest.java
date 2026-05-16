package ru.naumen.experts.template.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PlanTemplateRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotBlank
    private String description;

    @Size(max = 255)
    private String targetPosition;

    @Min(1)
    private Integer durationWeeks = 12;
}
