package ru.naumen.experts.exception;

public class UserNotInvitedToEventException extends RuntimeException {

    public UserNotInvitedToEventException(Long eventId, Long userId) {
        super("Пользователь с id '" + userId + "' не приглашен в мероприятие с id '" + eventId + "'");
    }
}
