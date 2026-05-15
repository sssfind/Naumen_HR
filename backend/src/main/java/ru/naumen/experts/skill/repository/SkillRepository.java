package ru.naumen.experts.skill.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.naumen.experts.skill.entity.Skill;
import ru.naumen.experts.skill.enums.SkillCategory;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByNameInAndCategory(List<String> names, SkillCategory category);
    List<Skill> findByCategoryAndIsActiveTrue(SkillCategory category);
}
