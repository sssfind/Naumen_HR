package ru.naumen.experts.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import ru.naumen.experts.department.entity.Department;
import ru.naumen.experts.user.enums.UserRole;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column
    private String department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Department orgDepartment;

    @Column(name = "responsibility_zone", length = 500)
    private String responsibilityZone;

    @Column
    private String phone;

    @Column
    private String position;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column
    private String team;

    @Column(name = "mood_level", nullable = false)
    @Builder.Default
    private Integer moodLevel = 3;

    @Column(name = "progress_block_one", nullable = false)
    @Builder.Default
    private Integer progressBlockOne = 0;

    @Column(name = "progress_block_two", nullable = false)
    @Builder.Default
    private Integer progressBlockTwo = 0;

    @Column(name = "progress_block_three", nullable = false)
    @Builder.Default
    private Integer progressBlockThree = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private UserRole role = UserRole.ROLE_EMPLOYEE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User hr;

    @OneToMany(mappedBy = "hr")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<User> trainees = new ArrayList<>();

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "adaptation_start_date")
    private LocalDate adaptationStartDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
