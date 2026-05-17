package ru.naumen.experts.hr.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignMentorRequest {

    @NotNull(message = "Укажите наставника")
    private Long mentorId;
}
