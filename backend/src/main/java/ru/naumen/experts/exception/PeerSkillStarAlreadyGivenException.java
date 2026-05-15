package ru.naumen.experts.exception;

public class PeerSkillStarAlreadyGivenException extends RuntimeException {

    public PeerSkillStarAlreadyGivenException() {
        super("Вы уже поставили звезду этому навыку");
    }
}
