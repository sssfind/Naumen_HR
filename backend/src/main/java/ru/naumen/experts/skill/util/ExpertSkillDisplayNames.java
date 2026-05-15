package ru.naumen.experts.skill.util;

import ru.naumen.experts.skill.entity.Skill;
import ru.naumen.experts.skill.enums.SkillCategory;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Русские подписи для экспертных (soft) навыков. Профессиональные (hard) имена не меняем.
 */
public final class ExpertSkillDisplayNames {

    private static final Map<String, String> ENGLISH_TO_RU = new HashMap<>();

    static {
        putPair("Public Speaking", "Публичные выступления");
        putPair("Mentoring", "Менторинг");
        putPair("Jury Work", "Работа в жюри");
        putPair("Lecture Delivery", "Лекции");
        putPair("Facilitation", "Фасилитация");
    }

    private ExpertSkillDisplayNames() {
    }

    private static void putPair(String english, String russian) {
        ENGLISH_TO_RU.put(english.trim().toLowerCase(Locale.ROOT), russian);
    }

    /**
     * Известные английские названия экспертных навыков → русский текст.
     * Если совпадения нет, возвращает исходную строку (уже русское или новое имя из БД).
     */
    public static String expertSkillNameRu(String rawName) {
        if (rawName == null || rawName.isBlank()) {
            return rawName == null ? "" : rawName;
        }
        String key = rawName.trim().toLowerCase(Locale.ROOT);
        return ENGLISH_TO_RU.getOrDefault(key, rawName.trim());
    }

    public static String displayName(Skill skill) {
        if (skill == null) {
            return "";
        }
        if (skill.getCategory() == SkillCategory.EXPERT) {
            return expertSkillNameRu(skill.getName());
        }
        return skill.getName() != null ? skill.getName() : "";
    }
}
