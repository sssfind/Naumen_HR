package ru.naumen.experts.dictionary.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SkillDictionaryDto {
    private Long id;
    private String name;
}
