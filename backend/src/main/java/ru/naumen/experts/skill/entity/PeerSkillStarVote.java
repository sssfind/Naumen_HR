package ru.naumen.experts.skill.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.naumen.experts.user.entity.User;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "peer_skill_star_vote",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_peer_skill_star_vote",
                columnNames = {"voter_user_id", "user_skill_id"}
        )
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerSkillStarVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voter_user_id", nullable = false)
    private User voter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_skill_id", nullable = false)
    private UserSkill userSkill;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
