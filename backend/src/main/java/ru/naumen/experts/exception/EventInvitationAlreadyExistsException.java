package ru.naumen.experts.exception;

public class EventInvitationAlreadyExistsException extends RuntimeException {

    public EventInvitationAlreadyExistsException(Long eventId, Long userId) {
        super("Пользователь с id '" + userId + "' уже приглашен на мероприятие с id '" + eventId + "'");
    }
}
