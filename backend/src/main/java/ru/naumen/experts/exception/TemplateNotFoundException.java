package ru.naumen.experts.exception;

public class TemplateNotFoundException extends RuntimeException {

    public TemplateNotFoundException(Long templateId) {
        super("Шаблон плана не найден: " + templateId);
    }
}
