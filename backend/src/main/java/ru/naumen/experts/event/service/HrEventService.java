package ru.naumen.experts.event.service;

import ru.naumen.experts.event.dto.*;

import java.util.List;

public interface HrEventService {

    HrEventListItemResponse createEvent(CreateHrEventRequest request, String hrEmail);

    List<HrEventListItemResponse> getEvents();

    HrEventDetailsResponse getEventDetails(Long eventId);

    HrEventInvitationResponse inviteUser(Long eventId, InviteUserToEventRequest request, Long hrUserId);

    HrEventParticipantExperienceResponse saveParticipantExperience(Long eventId, Long userId,
                                                                   SaveHrEventParticipantExperienceRequest request);

    void deleteEvent(Long eventId);
}
