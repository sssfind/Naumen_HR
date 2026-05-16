package ru.naumen.experts.traineeplan.enums;

public enum TraineePlanBlock {
    ONBOARDING("onboarding", "Знакомство с компанией и командой"),
    SKILLS("skills", "Прокачка скиллов"),
    WORK("work", "Рабочие задачи");

    private final String id;
    private final String title;

    TraineePlanBlock(String id, String title) {
        this.id = id;
        this.title = title;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }
}
