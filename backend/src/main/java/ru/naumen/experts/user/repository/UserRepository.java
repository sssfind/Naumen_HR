package ru.naumen.experts.user.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByHrIdAndRoleAndIsActiveTrue(Long hrId, UserRole role);

    List<User> findByMentorIdAndRoleAndIsActiveTrue(Long mentorId, UserRole role);

    List<User> findByRoleAndIsActiveTrue(UserRole role);

    @Query(value = """
            SELECT u FROM User u
            LEFT JOIN u.orgDepartment d
            LEFT JOIN d.parent
            WHERE u.isActive = true
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:department IS NULL OR :department = '' OR u.department = :department)
              AND (:departmentIds IS NULL OR u.orgDepartment.id IN :departmentIds)
            ORDER BY u.fullName ASC
            """,
            countQuery = """
            SELECT COUNT(u) FROM User u
            WHERE u.isActive = true
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:department IS NULL OR :department = '' OR u.department = :department)
              AND (:departmentIds IS NULL OR u.orgDepartment.id IN :departmentIds)
            """)
    Page<User> searchActiveUsers(
            @Param("search") String search,
            @Param("department") String department,
            @Param("departmentIds") List<Long> departmentIds,
            Pageable pageable);

    @Query(value = """
            SELECT u FROM User u
            LEFT JOIN u.orgDepartment d
            LEFT JOIN d.parent
            WHERE u.isActive = true
              AND u.id <> :excludeId
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:departmentIds IS NULL OR u.orgDepartment.id IN :departmentIds)
            ORDER BY
              CASE WHEN :team IS NOT NULL AND :team <> '' AND u.team = :team THEN 0
                   ELSE 1 END,
              u.fullName ASC
            """,
            countQuery = """
            SELECT COUNT(u) FROM User u
            WHERE u.isActive = true
              AND u.id <> :excludeId
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:departmentIds IS NULL OR u.orgDepartment.id IN :departmentIds)
            """)
    Page<User> searchActiveUsersForTrainee(
            @Param("excludeId") Long excludeId,
            @Param("team") String team,
            @Param("search") String search,
            @Param("departmentIds") List<Long> departmentIds,
            Pageable pageable);

    @Query("""
            SELECT u.orgDepartment.id, COUNT(u)
            FROM User u
            WHERE u.isActive = true AND u.orgDepartment IS NOT NULL
            GROUP BY u.orgDepartment.id
            """)
    List<Object[]> countActiveUsersByDepartmentId();
}
