package ru.naumen.experts.traineeplan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface TraineePlanTaskRepository extends JpaRepository<TraineePlanTask, Long> {

    List<TraineePlanTask> findByTraineeIdOrderByDeadlineAscIdAsc(Long traineeId);

    long countByTraineeIdAndBlock(Long traineeId, TraineePlanBlock block);

    long countByTraineeIdAndBlockAndStatus(Long traineeId, TraineePlanBlock block, TaskStatus status);

    long countByTraineeIdIn(Collection<Long> traineeIds);

    long countByTraineeIdInAndStatus(Collection<Long> traineeIds, TaskStatus status);

    long countByTraineeId(Long traineeId);

    long countByTraineeIdAndStatus(Long traineeId, TaskStatus status);

    void deleteByTraineeId(Long traineeId);

    @Query("""
            SELECT t FROM TraineePlanTask t
            WHERE t.trainee.id = :traineeId
              AND t.status IN (ru.naumen.experts.traineeplan.enums.TaskStatus.NOT_STARTED,
                               ru.naumen.experts.traineeplan.enums.TaskStatus.IN_PROGRESS)
              AND t.deadline = :deadline
            ORDER BY t.deadline ASC, t.id ASC
            """)
    List<TraineePlanTask> findIncompleteByTraineeAndDeadline(
            @Param("traineeId") Long traineeId, @Param("deadline") LocalDate deadline);

    @Query("""
            SELECT t FROM TraineePlanTask t
            WHERE t.trainee.id = :traineeId
              AND t.status IN (ru.naumen.experts.traineeplan.enums.TaskStatus.NOT_STARTED,
                               ru.naumen.experts.traineeplan.enums.TaskStatus.IN_PROGRESS)
              AND t.deadline < :today
            ORDER BY t.deadline ASC, t.id ASC
            """)
    List<TraineePlanTask> findOverdueIncompleteByTrainee(
            @Param("traineeId") Long traineeId, @Param("today") LocalDate today);

    @Query("""
            SELECT t FROM TraineePlanTask t
            JOIN FETCH t.trainee
            WHERE t.trainee.id IN :traineeIds
              AND t.status IN (ru.naumen.experts.traineeplan.enums.TaskStatus.NOT_STARTED,
                               ru.naumen.experts.traineeplan.enums.TaskStatus.IN_PROGRESS)
              AND t.deadline < :today
            ORDER BY t.trainee.fullName ASC, t.deadline ASC, t.id ASC
            """)
    List<TraineePlanTask> findOverdueIncompleteByTraineeIds(
            @Param("traineeIds") Collection<Long> traineeIds, @Param("today") LocalDate today);

    @Query("""
            SELECT t FROM TraineePlanTask t
            WHERE t.trainee.id = :traineeId
              AND t.status = ru.naumen.experts.traineeplan.enums.TaskStatus.IN_PROGRESS
            ORDER BY t.deadline ASC, t.id ASC
            """)
    List<TraineePlanTask> findInProgressByTrainee(@Param("traineeId") Long traineeId);

    @Query("""
            SELECT t FROM TraineePlanTask t
            WHERE t.trainee.id = :traineeId
              AND t.status = ru.naumen.experts.traineeplan.enums.TaskStatus.NOT_STARTED
            ORDER BY t.deadline ASC, t.id ASC
            """)
    List<TraineePlanTask> findNotStartedByTrainee(@Param("traineeId") Long traineeId);

    @Query("""
            SELECT t FROM TraineePlanTask t
            JOIN FETCH t.trainee
            WHERE t.trainee.id IN :traineeIds
              AND t.status = ru.naumen.experts.traineeplan.enums.TaskStatus.PENDING_REVIEW
            ORDER BY t.trainee.fullName ASC, t.deadline ASC, t.id ASC
            """)
    List<TraineePlanTask> findPendingReviewByTraineeIds(
            @Param("traineeIds") Collection<Long> traineeIds);
}
