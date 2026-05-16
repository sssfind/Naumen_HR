package ru.naumen.experts.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import ru.naumen.experts.user.enums.UserRole;

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

    @Column
    private String phone;

    @Column
    private String position;

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

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
