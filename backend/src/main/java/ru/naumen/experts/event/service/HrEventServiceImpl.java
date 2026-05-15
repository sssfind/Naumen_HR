package ru.naumen.experts.event.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.event.dto.*;
import ru.naumen.experts.event.entity.CorporateEvent;
import ru.naumen.experts.event.entity.EventInvitation;
import ru.naumen.experts.event.entity.UserEventExperience;
import ru.naumen.experts.event.repository.CorporateEventRepository;
import ru.naumen.experts.event.repository.EventInvitationRepository;
import ru.naumen.experts.event.repository.UserEventExperienceRepository;
import ru.naumen.experts.exception.EventInvitationAlreadyExistsException;
import ru.naumen.experts.exception.EventNotFoundException;
import ru.naumen.experts.exception.SelfInvitationNotAllowedException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.exception.UserNotInvitedToEventException;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.repository.UserRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HrEventServiceImpl implements HrEventService {

    private static final String HR_MANAGED_EVENT_TYPE = "HR_MANAGED";

    private final CorporateEventRepository corporateEventRepository;
    private final EventInvitationRepository eventInvitationRepository;
    private final UserEventExperienceRepository userEventExperienceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public HrEventListItemResponse createEvent(CreateHrEventRequest request, String hrEmail) {
        CorporateEvent event = CorporateEvent.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .eventType(HR_MANAGED_EVENT_TYPE)
                .eventDate(LocalDate.now())
                .organizer(hrEmail)
                .build();

        CorporateEvent savedEvent = corporateEventRepository.save(event);
        return toListItem(savedEvent, 0L);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HrEventListItemResponse> getEvents() {
        List<CorporateEvent> events = corporateEventRepository.findByEventType(
                HR_MANAGED_EVENT_TYPE,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"))
        );

        if (events.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> eventIds = events.stream()
                .map(CorporateEvent::getId)
                .toList();

        Map<Long, Long> invitedCounts = eventInvitationRepository.countByEventIds(eventIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        return events.stream()
                .map(event -> toListItem(event, invitedCounts.getOrDefault(event.getId(), 0L)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HrEventDetailsResponse getEventDetails(Long eventId) {
        CorporateEvent event = findEventOrThrow(eventId);
        List<EventInvitation> invitations = eventInvitationRepository.findByEventIdWithInvitedUser(eventId);
        List<Long> participantUserIds = invitations.stream()
                .map(invitation -> invitation.getInvitedUser().getId())
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, UserEventExperience> experienceByUserId = participantUserIds.isEmpty()
                ? Map.of()
                : userEventExperienceRepository.findByEvent_IdAndUser_IdIn(eventId, participantUserIds).stream()
                        .sorted(Comparator.comparing(UserEventExperience::getId))
                        .collect(Collectors.toMap(
                                experience -> experience.getUser().getId(),
                                experience -> experience,
                                (existing, ignored) -> existing
                        ));

        List<HrEventParticipantResponse> participants = invitations.stream()
                .map(invitation -> toParticipantResponse(
                        invitation,
                        experienceByUserId.get(invitation.getInvitedUser().getId())
                ))
                .toList();

        return HrEventDetailsResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventType(event.getEventType())
                .eventDate(event.getEventDate())
                .organizer(event.getOrganizer())
                .createdAt(event.getCreatedAt())
                .invitedCount(participants.size())
                .participants(participants)
                .build();
    }

    @Override
    @Transactional
    public HrEventInvitationResponse inviteUser(Long eventId, InviteUserToEventRequest request, Long hrUserId) {
        if (hrUserId.equals(request.getUserId())) {
            throw new SelfInvitationNotAllowedException();
        }

        CorporateEvent event = findEventOrThrow(eventId);
        User invitedUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException(request.getUserId()));

        if (eventInvitationRepository.existsByEvent_IdAndInvitedUser_Id(eventId, request.getUserId())) {
            throw new EventInvitationAlreadyExistsException(eventId, request.getUserId());
        }

        EventInvitation invitation = EventInvitation.builder()
                .event(event)
                .invitedUser(invitedUser)
                .invitedByUser(userRepository.getReferenceById(hrUserId))
                .build();

        try {
            EventInvitation savedInvitation = eventInvitationRepository.save(invitation);
            return toInvitationResponse(savedInvitation, invitedUser);
        } catch (DataIntegrityViolationException ex) {
            throw new EventInvitationAlreadyExistsException(eventId, request.getUserId());
        }
    }

    @Override
    @Transactional
    public HrEventParticipantExperienceResponse saveParticipantExperience(Long eventId, Long userId,
                                                                          SaveHrEventParticipantExperienceRequest request) {
        CorporateEvent event = findEventOrThrow(eventId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (!eventInvitationRepository.existsByEvent_IdAndInvitedUser_Id(eventId, userId)) {
            throw new UserNotInvitedToEventException(eventId, userId);
        }

        UserEventExperience experience = userEventExperienceRepository
                .findFirstByEvent_IdAndUser_IdOrderByIdAsc(eventId, userId)
                .orElseGet(() -> UserEventExperience.builder()
                        .event(event)
                        .user(user)
                        .build());

        experience.setParticipationRole(request.getParticipationRole());
        experience.setResultLevel(request.getResultLevel());
        experience.setFeedback(normalizeFeedback(request.getFeedback()));

        UserEventExperience saved = userEventExperienceRepository.save(experience);
        return HrEventParticipantExperienceResponse.builder()
                .eventId(saved.getEvent().getId())
                .userId(saved.getUser().getId())
                .participationRole(saved.getParticipationRole())
                .resultLevel(saved.getResultLevel())
                .feedback(saved.getFeedback())
                .build();
    }

    @Override
    @Transactional
    public void deleteEvent(Long eventId) {
        CorporateEvent event = findEventOrThrow(eventId);
        eventInvitationRepository.deleteByEvent_Id(eventId);
        corporateEventRepository.delete(event);
    }

    private CorporateEvent findEventOrThrow(Long eventId) {
        return corporateEventRepository.findByIdAndEventType(eventId, HR_MANAGED_EVENT_TYPE)
                .orElseThrow(() -> new EventNotFoundException(eventId));
    }

    private HrEventListItemResponse toListItem(CorporateEvent event, long invitedCount) {
        return HrEventListItemResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventType(event.getEventType())
                .eventDate(event.getEventDate())
                .organizer(event.getOrganizer())
                .createdAt(event.getCreatedAt())
                .invitedCount(invitedCount)
                .build();
    }

    private HrEventParticipantResponse toParticipantResponse(EventInvitation invitation,
                                                             UserEventExperience experience) {
        User invitedUser = invitation.getInvitedUser();
        return HrEventParticipantResponse.builder()
                .userId(invitedUser.getId())
                .fullName(invitedUser.getFullName())
                .email(invitedUser.getEmail())
                .department(invitedUser.getDepartment())
                .invitedAt(invitation.getInvitedAt())
                .status(invitation.getStatus().name())
                .profileEventSaved(experience != null)
                .participationRole(experience != null ? experience.getParticipationRole() : null)
                .resultLevel(experience != null ? experience.getResultLevel() : null)
                .feedback(experience != null ? experience.getFeedback() : null)
                .build();
    }

    private String normalizeFeedback(String feedback) {
        if (feedback == null) {
            return null;
        }
        String normalized = feedback.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private HrEventInvitationResponse toInvitationResponse(EventInvitation invitation, User invitedUser) {
        return HrEventInvitationResponse.builder()
                .invitationId(invitation.getId())
                .eventId(invitation.getEvent().getId())
                .userId(invitedUser.getId())
                .fullName(invitedUser.getFullName())
                .email(invitedUser.getEmail())
                .department(invitedUser.getDepartment())
                .invitedAt(invitation.getInvitedAt())
                .status(invitation.getStatus().name())
                .build();
    }
}
