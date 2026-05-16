package ru.naumen.experts.traineeplan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;

import java.util.List;

public interface TraineePlanTaskRepository extends JpaRepository<TraineePlanTask, Long> {

    List<TraineePlanTask> findByTraineeIdOrderByDeadlineAscIdAsc(Long traineeId);
}
