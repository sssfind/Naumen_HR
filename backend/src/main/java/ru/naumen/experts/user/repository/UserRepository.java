package ru.naumen.experts.user.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import ru.naumen.experts.user.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    @EntityGraph(attributePaths = {"readiness"})
    @NonNull
    @Override
    Page<User> findAll(@Nullable Specification<User> spec, @NonNull Pageable pageable);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"readiness"})
    Optional<User> findWithReadinessById(Long id);

    @Query(value = """
            SELECT u.id, COUNT(DISTINCT us.skill_id) AS overlap_count
            FROM users u
            INNER JOIN user_skill us ON us.user_id = u.id
            WHERE u.is_active = TRUE
              AND u.id <> :userId
              AND us.skill_id IN (:skillIds)
              AND (:deptMode = 0 OR u.department = :department)
            GROUP BY u.id
            ORDER BY overlap_count DESC, u.full_name ASC
            LIMIT 5
            """, nativeQuery = true)
    List<Object[]> findTopSimilarUserIdsBySkillOverlap(
            @Param("userId") Long userId,
            @Param("skillIds") List<Long> skillIds,
            @Param("deptMode") int deptMode,
            @Param("department") String department
    );

    @Query("""
            SELECT u FROM User u
            WHERE u.isActive = TRUE AND u.id <> :userId
              AND (:deptMode = 0 OR u.department = :department)
            ORDER BY u.fullName ASC
            """)
    List<User> findSimilarCandidatesWithoutOverlap(
            @Param("userId") Long userId,
            @Param("deptMode") int deptMode,
            @Param("department") String department,
            Pageable pageable
    );
}
