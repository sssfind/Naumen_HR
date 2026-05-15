package ru.naumen.experts.event.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.event.enums.ParticipationRole;
import ru.naumen.experts.event.enums.ResultLevel;

import java.time.OffsetDateTime;

@Data
@Builder
public class HrEventParticipantResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String department;
    private OffsetDateTime invitedAt;
    private String status;
    private boolean profileEventSaved;
    private ParticipationRole participationRole;
    private ResultLevel resultLevel;
    private String feedback;
}
