package ru.naumen.experts.expert.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import ru.naumen.experts.skill.entity.Skill;
import ru.naumen.experts.skill.entity.UserSkill;
import ru.naumen.experts.skill.enums.SkillCategory;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.entity.UserReadiness;
import ru.naumen.experts.user.enums.ReadinessEventType;

import java.util.List;

public class UserSpecification {

    private static final String EXCLUDED_SEED_EMAIL_PATTERN = "employee__@naumen.ru";

    private UserSpecification() {}

    public static Specification<User> activeUsers() {
        return (root, query, cb) -> cb.and(
                cb.isTrue(root.get("isActive")),
                cb.notLike(cb.lower(root.get("email")), EXCLUDED_SEED_EMAIL_PATTERN)
        );
    }

    public static Specification<User> matchesQuery(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) return null;
        return (root, query, cb) -> {
            query.distinct(true);
            String likePattern = "%" + rawQuery.trim().toLowerCase() + "%";

            Join<User, UserSkill> userSkillJoin = root.join("userSkills", JoinType.LEFT);
            Join<UserSkill, Skill> skillJoin = userSkillJoin.join("skill", JoinType.LEFT);

            Predicate fullNameLike = cb.like(cb.lower(root.get("fullName")), likePattern);
            Predicate departmentLike = cb.like(cb.lower(root.get("department")), likePattern);
            Predicate skillNameLike = cb.like(cb.lower(skillJoin.get("name")), likePattern);

            return cb.or(fullNameLike, departmentLike, skillNameLike);
        };
    }

    // --- Фильтрация по ID навыков (основной способ) ---

    public static Specification<User> hasHardSkillIds(List<Long> skillIds) {
        if (skillIds == null || skillIds.isEmpty()) return null;
        return (root, query, cb) -> {
            query.distinct(true);
            Join<User, UserSkill> userSkillJoin = root.join("userSkills", JoinType.INNER);
            Join<UserSkill, Skill> skillJoin = userSkillJoin.join("skill", JoinType.INNER);
            return cb.and(
                    skillJoin.get("id").in(skillIds),
                    cb.equal(skillJoin.get("category"), SkillCategory.PROFESSIONAL)
            );
        };
    }

    public static Specification<User> hasExpertSkillIds(List<Long> skillIds) {
        if (skillIds == null || skillIds.isEmpty()) return null;
        return (root, query, cb) -> {
            query.distinct(true);
            Join<User, UserSkill> userSkillJoin = root.join("userSkills", JoinType.INNER);
            Join<UserSkill, Skill> skillJoin = userSkillJoin.join("skill", JoinType.INNER);
            return cb.and(
                    skillJoin.get("id").in(skillIds),
                    cb.equal(skillJoin.get("category"), SkillCategory.EXPERT)
            );
        };
    }

    // --- Фильтрация по именам навыков (обратная совместимость) ---

    public static Specification<User> hasHardSkills(List<String> skillNames) {
        if (skillNames == null || skillNames.isEmpty()) return null;
        return (root, query, cb) -> {
            query.distinct(true);
            Join<User, UserSkill> userSkillJoin = root.join("userSkills", JoinType.INNER);
            Join<UserSkill, Skill> skillJoin = userSkillJoin.join("skill", JoinType.INNER);
            return cb.and(
                    skillJoin.get("name").in(skillNames),
                    cb.equal(skillJoin.get("category"), SkillCategory.PROFESSIONAL)
            );
        };
    }

    public static Specification<User> hasExpertSkills(List<String> skillNames) {
        if (skillNames == null || skillNames.isEmpty()) return null;
        return (root, query, cb) -> {
            query.distinct(true);
            Join<User, UserSkill> userSkillJoin = root.join("userSkills", JoinType.INNER);
            Join<UserSkill, Skill> skillJoin = userSkillJoin.join("skill", JoinType.INNER);
            return cb.and(
                    skillJoin.get("name").in(skillNames),
                    cb.equal(skillJoin.get("category"), SkillCategory.EXPERT)
            );
        };
    }

    // --- Фильтрация по готовности (несколько значений — OR между ними) ---

    public static Specification<User> hasReadinessIn(List<ReadinessEventType> types) {
        if (types == null || types.isEmpty()) return null;
        return (root, query, cb) -> {
            query.distinct(true);
            Join<User, UserReadiness> readinessJoin = root.join("readiness", JoinType.INNER);
            return readinessJoin.get("readinessEventType").in(types);
        };
    }

    public static Specification<User> hasReadiness(ReadinessEventType readinessEventType) {
        if (readinessEventType == null) return null;
        return hasReadinessIn(List.of(readinessEventType));
    }

    // --- Главный метод сборки спецификации (новый, по IDs) ---

    public static Specification<User> buildSearchSpec(ExpertSearchCriteriaRef criteria) {
        Specification<User> spec = activeUsers();
        Specification<User> skillSpec = buildSkillSpec(criteria);
        if (skillSpec != null) {
            spec = spec.and(skillSpec);
        }
        if (hasValues(criteria.readinessStatuses())) {
            spec = spec.and(hasReadinessIn(criteria.readinessStatuses()));
        }
        if (hasText(criteria.query())) {
            spec = spec.and(matchesQuery(criteria.query()));
        }
        return spec;
    }

    private static Specification<User> buildSkillSpec(ExpertSearchCriteriaRef criteria) {
        Specification<User> hardSpec = hasValues(criteria.hardSkillIds())
                ? hasHardSkillIds(criteria.hardSkillIds())
                : hasValues(criteria.hardSkills()) ? hasHardSkills(criteria.hardSkills()) : null;

        Specification<User> expertSpec = hasValues(criteria.expertSkillIds())
                ? hasExpertSkillIds(criteria.expertSkillIds())
                : hasValues(criteria.expertSkills()) ? hasExpertSkills(criteria.expertSkills()) : null;

        if (hardSpec == null) return expertSpec;
        if (expertSpec == null) return hardSpec;
        return hardSpec.or(expertSpec);
    }

    private static boolean hasValues(List<?> values) {
        return values != null && !values.isEmpty();
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    // --- Обратная совместимость: старая сигнатура buildSearchSpec ---

    public static Specification<User> buildSearchSpec(
            List<String> hardSkills,
            List<String> expertSkills,
            ReadinessEventType readinessEventType) {
        return buildSearchSpec(new ExpertSearchCriteriaRef(
                null, null, null,
                readinessEventType != null ? List.of(readinessEventType) : null,
                hardSkills, expertSkills
        ));
    }

    public record ExpertSearchCriteriaRef(
            String query,
            List<Long> hardSkillIds,
            List<Long> expertSkillIds,
            List<ReadinessEventType> readinessStatuses,
            List<String> hardSkills,
            List<String> expertSkills
    ) {}
}
