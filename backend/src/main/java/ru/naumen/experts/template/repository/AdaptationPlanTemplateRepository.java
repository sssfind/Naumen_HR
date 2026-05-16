package ru.naumen.experts.template.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.naumen.experts.template.entity.AdaptationPlanTemplate;

import java.util.List;
import java.util.Optional;

public interface AdaptationPlanTemplateRepository extends JpaRepository<AdaptationPlanTemplate, Long> {

    @Query("""
            SELECT t FROM AdaptationPlanTemplate t
            WHERE t.system = true OR t.createdByHr.id = :hrId
            ORDER BY t.system DESC, t.name ASC
            """)
    List<AdaptationPlanTemplate> findAvailableForHr(@Param("hrId") Long hrId);

    @Query("""
            SELECT t FROM AdaptationPlanTemplate t
            LEFT JOIN FETCH t.tasks
            WHERE t.id = :id AND (t.system = true OR t.createdByHr.id = :hrId)
            """)
    Optional<AdaptationPlanTemplate> findByIdForHr(@Param("id") Long id, @Param("hrId") Long hrId);
}
