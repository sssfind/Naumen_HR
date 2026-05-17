package ru.naumen.experts.traineeplan.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import ru.naumen.experts.traineeplan.enums.AcceptanceCheckType;
import ru.naumen.experts.traineeplan.enums.TaskPriority;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;
import ru.naumen.experts.user.entity.User;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trainee_plan_tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraineePlanTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainee_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User trainee;

    @Enumerated(EnumType.STRING)
    @Column(name = "block", nullable = false, length = 32)
    private TraineePlanBlock block;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "deadline", nullable = false)
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 32)
    private TaskPriority priority;

    @Column(name = "acceptance_criteria", nullable = false, columnDefinition = "TEXT")
    private String acceptanceCriteria;

    @Enumerated(EnumType.STRING)
    @Column(name = "acceptance_check_type", nullable = false, length = 32)
    private AcceptanceCheckType acceptanceCheckType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    @Builder.Default
    private TaskStatus status = TaskStatus.NOT_STARTED;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "rejection_comment", columnDefinition = "TEXT")
    private String rejectionComment;

    @Column(name = "is_milestone", nullable = false)
    @Builder.Default
    private boolean milestone = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
