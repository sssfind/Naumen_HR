package ru.naumen.experts.invitation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.naumen.experts.invitation.dto.InvitationRequest;
import ru.naumen.experts.invitation.dto.InvitationResponse;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    @Override
    public InvitationResponse invite(InvitationRequest request, Long inviterUserId) {
        if (Objects.equals(request.getExpertId(), inviterUserId)) {
            throw new IllegalArgumentException("Нельзя пригласить самого себя");
        }

        log.info(
                "Пользователь [{}] приглашен пользователем [{}] на мероприятие [{}]",
                request.getExpertId(),
                inviterUserId,
                request.getEventName()
        );

        return InvitationResponse.builder()
                .message("Приглашение отправлено")
                .inviterUserId(inviterUserId)
                .invitedUserId(request.getExpertId())
                .eventName(request.getEventName())
                .expertId(request.getExpertId())
                .build();
    }
}
