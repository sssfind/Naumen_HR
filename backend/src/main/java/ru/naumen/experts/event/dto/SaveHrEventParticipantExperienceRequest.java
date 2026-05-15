package ru.naumen.experts.event.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.naumen.experts.event.enums.ParticipationRole;
import ru.naumen.experts.event.enums.ResultLevel;

@Data
public class SaveHrEventParticipantExperienceRequest {

    @NotNull
    private ParticipationRole participationRole;

    @NotNull
    private ResultLevel resultLevel;

    @Size(max = 5000)
    private String feedback;
}
