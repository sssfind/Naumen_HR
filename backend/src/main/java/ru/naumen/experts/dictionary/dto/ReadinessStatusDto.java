package ru.naumen.experts.dictionary.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReadinessStatusDto {
    private String key;
    private String label;
}
