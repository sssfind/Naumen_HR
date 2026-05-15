package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.skill.enums.ProficiencyLevel;

@Data
@Builder
public class UserCardSkillDto {

    private Long userSkillId;
    private Long id;
    private String name;
    private Integer stars;
    private ProficiencyLevel proficiencyLevel;
}
