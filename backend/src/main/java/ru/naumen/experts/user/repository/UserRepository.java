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

    @Query("""
            SELECT u FROM User u
            WHERE u.isActive = true
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:department IS NULL OR :department = '' OR u.department = :department)
            ORDER BY u.fullName ASC
            """)
    Page<User> searchActiveUsers(
            @Param("search") String search,
            @Param("department") String department,
            Pageable pageable);
}
