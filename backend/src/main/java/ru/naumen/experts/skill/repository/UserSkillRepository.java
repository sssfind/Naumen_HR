package ru.naumen.experts.skill.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.naumen.experts.skill.entity.UserSkill;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    @Query("SELECT us FROM UserSkill us JOIN FETCH us.skill WHERE us.user.id IN :userIds ORDER BY us.stars DESC")
    List<UserSkill> findTopSkillsByUserIds(@Param("userIds") List<Long> userIds);

    @Query("""
            SELECT us FROM UserSkill us
            JOIN FETCH us.skill
            WHERE us.user.id IN :userIds
            ORDER BY us.user.id ASC, us.stars DESC, us.skill.name ASC
            """)
    List<UserSkill> findWithSkillByUserIdIn(@Param("userIds") Collection<Long> userIds);

    Optional<UserSkill> findByIdAndUser_Id(Long id, Long userId);

    Optional<UserSkill> findByUser_IdAndSkill_Id(Long userId, Long skillId);

    boolean existsByUser_IdAndSkill_Id(Long userId, Long skillId);

    @Query("""
            SELECT us.user.id, COUNT(us.id)
            FROM UserSkill us
            WHERE us.user.id IN :userIds
            GROUP BY us.user.id
            """)
    List<Object[]> countSkillsByUserIdIn(@Param("userIds") Collection<Long> userIds);

    @Query("""
            SELECT us.user.id, COALESCE(SUM(us.stars), 0)
            FROM UserSkill us
            WHERE us.user.id IN :userIds
              AND us.skill.id IN :skillIds
            GROUP BY us.user.id
            """)
    List<Object[]> sumStarsByUserIdAndSkillIdIn(@Param("userIds") Collection<Long> userIds,
                                                @Param("skillIds") Collection<Long> skillIds);
}
