package ru.naumen.experts.exception;

public class EventNotFoundException extends RuntimeException {

    public EventNotFoundException(Long eventId) {
        super("Мероприятие с id '" + eventId + "' не найдено");
    }
}
