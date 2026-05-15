package ru.naumen.experts.skill.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.naumen.experts.skill.enums.ProficiencyLevel;

@Data
public class UpdateMySkillRequest {

    @NotNull(message = "proficiencyLevel обязателен")
    private ProficiencyLevel proficiencyLevel;
}
