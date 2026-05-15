package ru.naumen.experts.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class HrEventInvitationResponse {
    private Long invitationId;
    private Long eventId;
    private Long userId;
    private String fullName;
    private String email;
    private String department;
    private OffsetDateTime invitedAt;
    private String status;
}
