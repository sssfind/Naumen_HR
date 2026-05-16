package ru.naumen.experts.feedback.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.naumen.experts.feedback.entity.FeedbackResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FeedbackResponseRepository extends JpaRepository<FeedbackResponse, Long> {

    boolean existsByTraineeIdAndWeekStart(Long traineeId, LocalDate weekStart);

    Optional<FeedbackResponse> findByTraineeIdAndWeekStart(Long traineeId, LocalDate weekStart);

    List<FeedbackResponse> findByTraineeIdOrderByWeekStartDesc(Long traineeId, Pageable pageable);

    Optional<FeedbackResponse> findTopByTraineeIdOrderByWeekStartDesc(Long traineeId);
}
