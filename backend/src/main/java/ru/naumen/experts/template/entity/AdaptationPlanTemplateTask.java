package ru.naumen.experts.template.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.naumen.experts.traineeplan.enums.AcceptanceCheckType;
import ru.naumen.experts.traineeplan.enums.TaskPriority;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;

@Entity
@Table(name = "adaptation_plan_template_tasks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptationPlanTemplateTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private AdaptationPlanTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(name = "block", nullable = false, length = 32)
    private TraineePlanBlock block;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "acceptance_criteria", nullable = false, columnDefinition = "TEXT")
    private String acceptanceCriteria;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 32)
    private TaskPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "acceptance_check_type", nullable = false, length = 32)
    private AcceptanceCheckType acceptanceCheckType;

    @Column(name = "days_from_start", nullable = false)
    private Integer daysFromStart;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_milestone", nullable = false)
    @Builder.Default
    private boolean milestone = false;
}
