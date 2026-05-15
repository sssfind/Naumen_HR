package ru.naumen.experts.event.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import ru.naumen.experts.event.enums.ParticipationRole;
import ru.naumen.experts.event.enums.ResultLevel;
import ru.naumen.experts.user.entity.User;

import java.time.OffsetDateTime;

@Entity
@Table(name = "user_event_experience")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEventExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private CorporateEvent event;

    @Enumerated(EnumType.STRING)
    @Column(name = "participation_role", nullable = false)
    private ParticipationRole participationRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "result_level", nullable = false)
    @Builder.Default
    private ResultLevel resultLevel = ResultLevel.NONE;

    @Column(columnDefinition = "text")
    private String feedback;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
