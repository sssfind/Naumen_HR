package ru.naumen.experts.invitation.service;

import ru.naumen.experts.invitation.dto.InvitationRequest;
import ru.naumen.experts.invitation.dto.InvitationResponse;

public interface InvitationService {
    InvitationResponse invite(InvitationRequest request, Long inviterUserId);
}
