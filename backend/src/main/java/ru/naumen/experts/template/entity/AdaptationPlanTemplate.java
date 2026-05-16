package ru.naumen.experts.template.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import ru.naumen.experts.user.entity.User;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "adaptation_plan_templates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptationPlanTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_position")
    private String targetPosition;

    @Column(name = "duration_weeks", nullable = false)
    @Builder.Default
    private Integer durationWeeks = 12;

    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private boolean system = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_hr_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdByHr;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("sortOrder ASC, id ASC")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<AdaptationPlanTemplateTask> tasks = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
