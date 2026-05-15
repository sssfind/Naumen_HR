package ru.naumen.experts.exception;

public class SelfInvitationNotAllowedException extends RuntimeException {

    public SelfInvitationNotAllowedException() {
        super("Нельзя пригласить самого себя");
    }
}
