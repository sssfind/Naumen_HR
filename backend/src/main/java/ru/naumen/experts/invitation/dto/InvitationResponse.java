package ru.naumen.experts.invitation.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvitationResponse {
    private String message;
    private Long inviterUserId;
    private Long invitedUserId;
    private String eventName;
    private Long expertId;
}
