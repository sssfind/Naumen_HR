package ru.naumen.experts.skill.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.naumen.experts.skill.enums.ProficiencyLevel;
import ru.naumen.experts.user.entity.User;

import java.time.OffsetDateTime;

@Entity
@Table(name = "user_skill")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", nullable = false)
    private ProficiencyLevel proficiencyLevel;

    @Column(nullable = false)
    @Builder.Default
    private Integer stars = 0;

    @Column
    private String notes;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
