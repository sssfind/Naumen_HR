package ru.naumen.experts.feedback.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import ru.naumen.experts.feedback.enums.WeekRating;
import ru.naumen.experts.user.entity.User;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "feedback_responses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainee_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User trainee;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Enumerated(EnumType.STRING)
    @Column(name = "week_rating", nullable = false, length = 32)
    private WeekRating weekRating;

    @Column(name = "tasks_clarity", nullable = false)
    private Integer tasksClarity;

    /** Значения ResourceIssue через запятую, например: ALL_OK или NO_FOLDER_ACCESS,OTHER */
    @Column(name = "resource_issues", nullable = false, length = 512)
    private String resourceIssues;

    @Column(name = "mentor_rating", nullable = false)
    private Integer mentorRating;

    @Column(name = "week_comment", columnDefinition = "TEXT")
    private String weekComment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
