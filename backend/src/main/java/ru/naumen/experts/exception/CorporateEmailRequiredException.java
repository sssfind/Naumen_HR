package ru.naumen.experts.exception;

public class CorporateEmailRequiredException extends RuntimeException {

    public CorporateEmailRequiredException(String email) {
        super("Регистрация разрешена только для корпоративной почты @naumen.ru. Получен: " + email);
    }
}
