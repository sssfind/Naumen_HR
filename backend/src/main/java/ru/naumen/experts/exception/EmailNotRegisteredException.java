package ru.naumen.experts.exception;

public class EmailNotRegisteredException extends RuntimeException {

    public EmailNotRegisteredException() {
        super("Такая почта не зарегистрирована");
    }
}
