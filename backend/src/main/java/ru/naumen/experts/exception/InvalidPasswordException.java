package ru.naumen.experts.exception;

public class InvalidPasswordException extends RuntimeException {

    public InvalidPasswordException() {
        super("Неправильный пароль");
    }
}
