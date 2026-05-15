package ru.naumen.experts.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String email) {
        super("Пользователь с email '" + email + "' не найден");
    }

    public UserNotFoundException(Long id) {
        super("Пользователь с id '" + id + "' не найден");
    }
}
