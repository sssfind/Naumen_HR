package ru.naumen.experts.traineeplan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;

import java.util.List;

public interface TraineePlanTaskRepository extends JpaRepository<TraineePlanTask, Long> {

    List<TraineePlanTask> findByTraineeIdOrderByDeadlineAscIdAsc(Long traineeId);

    long countByTraineeIdAndBlock(Long traineeId, TraineePlanBlock block);

    long countByTraineeIdAndBlockAndStatus(Long traineeId, TraineePlanBlock block, TaskStatus status);
}
