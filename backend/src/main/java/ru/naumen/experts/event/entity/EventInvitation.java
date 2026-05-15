package ru.naumen.experts.event.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import ru.naumen.experts.event.enums.EventInvitationStatus;
import ru.naumen.experts.user.entity.User;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "event_invitations",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_event_invitations_event_user",
                columnNames = {"event_id", "invited_user_id"}
        )
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private CorporateEvent event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invited_user_id", nullable = false)
    private User invitedUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invited_by_user_id", nullable = false)
    private User invitedByUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private EventInvitationStatus status = EventInvitationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "invited_at", nullable = false, updatable = false)
    private OffsetDateTime invitedAt;
}
