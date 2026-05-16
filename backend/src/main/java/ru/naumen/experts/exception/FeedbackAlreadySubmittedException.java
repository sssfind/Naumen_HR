package ru.naumen.experts.exception;

public class FeedbackAlreadySubmittedException extends RuntimeException {

    public FeedbackAlreadySubmittedException() {
        super("Опрос за текущую неделю уже заполнен");
    }
}
