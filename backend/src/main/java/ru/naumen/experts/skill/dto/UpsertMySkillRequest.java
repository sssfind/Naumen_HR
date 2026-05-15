package ru.naumen.experts.skill.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.naumen.experts.skill.enums.ProficiencyLevel;

@Data
public class UpsertMySkillRequest {

    @NotNull(message = "skillId обязателен")
    private Long skillId;

    @NotNull(message = "proficiencyLevel обязателен")
    private ProficiencyLevel proficiencyLevel;
}
