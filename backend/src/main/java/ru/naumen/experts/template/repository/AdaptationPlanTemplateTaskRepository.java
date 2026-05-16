package ru.naumen.experts.template.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.naumen.experts.template.entity.AdaptationPlanTemplateTask;

import java.util.List;
import java.util.Optional;

public interface AdaptationPlanTemplateTaskRepository extends JpaRepository<AdaptationPlanTemplateTask, Long> {

    List<AdaptationPlanTemplateTask> findByTemplateIdOrderBySortOrderAscIdAsc(Long templateId);

    Optional<AdaptationPlanTemplateTask> findByIdAndTemplateId(Long id, Long templateId);

    long countByTemplateId(Long templateId);
}
