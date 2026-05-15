package ru.naumen.experts.event.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.event.enums.ParticipationRole;
import ru.naumen.experts.event.enums.ResultLevel;

@Data
@Builder
public class HrEventParticipantExperienceResponse {
    private Long eventId;
    private Long userId;
    private ParticipationRole participationRole;
    private ResultLevel resultLevel;
    private String feedback;
}
