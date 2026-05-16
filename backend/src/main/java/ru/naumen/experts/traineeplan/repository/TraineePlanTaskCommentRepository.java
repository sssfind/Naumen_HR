package ru.naumen.experts.traineeplan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.naumen.experts.traineeplan.entity.TraineePlanTaskComment;

import java.util.Collection;
import java.util.List;

public interface TraineePlanTaskCommentRepository extends JpaRepository<TraineePlanTaskComment, Long> {

    List<TraineePlanTaskComment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    List<TraineePlanTaskComment> findByTaskIdInOrderByCreatedAtAsc(Collection<Long> taskIds);
}
