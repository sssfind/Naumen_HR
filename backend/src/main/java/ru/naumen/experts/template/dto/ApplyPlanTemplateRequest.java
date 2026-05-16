package ru.naumen.experts.template.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ApplyPlanTemplateRequest {

    private LocalDate startDate;
    private boolean replaceExisting;
}
