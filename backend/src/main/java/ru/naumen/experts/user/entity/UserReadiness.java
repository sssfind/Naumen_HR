package ru.naumen.experts.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import ru.naumen.experts.user.enums.ReadinessEventType;

import java.time.OffsetDateTime;

@Entity
@Table(name = "user_readiness")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReadiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "readiness_event_type", nullable = false)
    private ReadinessEventType readinessEventType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
