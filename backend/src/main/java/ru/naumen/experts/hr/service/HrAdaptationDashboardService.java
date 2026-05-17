package ru.naumen.experts.hr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.feedback.entity.FeedbackResponse;
import ru.naumen.experts.feedback.repository.FeedbackResponseRepository;
import ru.naumen.experts.feedback.service.FeedbackRiskEvaluator;
import ru.naumen.experts.feedback.service.FeedbackService;
import ru.naumen.experts.hr.dto.HrAdaptationDashboardResponse;
import ru.naumen.experts.hr.dto.HrTeamStatsResponse;
import ru.naumen.experts.hr.dto.OverdueTaskItem;
import ru.naumen.experts.hr.dto.TraineeFeedbackPendingItem;
import ru.naumen.experts.hr.dto.TraineeOverdueTasksItem;
import ru.naumen.experts.hr.dto.TraineeRiskAlertItem;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskRepository;
import ru.naumen.experts.user.entity.User;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HrAdaptationDashboardService {

    private final HrTraineeService hrTraineeService;
    private final FeedbackResponseRepository feedbackRepository;
    private final TraineePlanTaskRepository taskRepository;

    @Transactional(readOnly = true)
    public HrAdaptationDashboardResponse getDashboard(Long staffId) {
        HrTeamStatsResponse stats = hrTraineeService.getTeamStats(staffId);
        List<User> trainees = hrTraineeService.listTraineesForStaff(staffId);
        LocalDate weekStart = FeedbackService.currentWeekStart();
        LocalDate today = LocalDate.now();

        List<TraineeRiskAlertItem> atRisk = new ArrayList<>();
        List<TraineeFeedbackPendingItem> feedbackPending = new ArrayList<>();

        for (User trainee : trainees) {
            Optional<FeedbackResponse> latestFeedback = feedbackRepository
                    .findTopByTraineeIdOrderByWeekStartDesc(trainee.getId());

            if (latestFeedback.isPresent() && FeedbackRiskEvaluator.isRisk(latestFeedback.get())) {
                FeedbackResponse feedback = latestFeedback.get();
                atRisk.add(TraineeRiskAlertItem.builder()
                        .traineeId(trainee.getId())
                        .fullName(trainee.getFullName())
                        .moodLevel(trainee.getMoodLevel())
                        .feedbackWeekStart(feedback.getWeekStart())
                        .weekRating(feedback.getWeekRating())
                        .sentimentScore(feedback.getSentimentScore())
                        .sentimentLabel(feedback.getSentimentLabel())
                        .commentSummary(feedback.getCommentSummary())
                        .riskSummary(FeedbackRiskEvaluator.buildRiskSummary(feedback))
                        .build());
            } else if (trainee.getMoodLevel() != null && trainee.getMoodLevel() <= 2) {
                atRisk.add(TraineeRiskAlertItem.builder()
                        .traineeId(trainee.getId())
                        .fullName(trainee.getFullName())
                        .moodLevel(trainee.getMoodLevel())
                        .feedbackWeekStart(latestFeedback.map(FeedbackResponse::getWeekStart).orElse(null))
                        .weekRating(latestFeedback.map(FeedbackResponse::getWeekRating).orElse(null))
                        .riskSummary("низкий индекс настроения (" + trainee.getMoodLevel() + "/5)")
                        .build());
            }

            if (!feedbackRepository.existsByTraineeIdAndWeekStart(trainee.getId(), weekStart)) {
                feedbackPending.add(TraineeFeedbackPendingItem.builder()
                        .traineeId(trainee.getId())
                        .fullName(trainee.getFullName())
                        .weekStart(weekStart)
                        .build());
            }
        }

        atRisk.sort(Comparator.comparing(TraineeRiskAlertItem::getFullName));
        feedbackPending.sort(Comparator.comparing(TraineeFeedbackPendingItem::getFullName));

        List<TraineeOverdueTasksItem> overdueByTrainee = buildOverdueByTrainee(trainees, today);
        Double averageSentiment = computeAverageSentimentScore(trainees);

        return HrAdaptationDashboardResponse.builder()
                .traineeCount(stats.getTraineeCount())
                .averageMoodLevel(stats.getAverageMoodLevel())
                .averageSentimentScore(averageSentiment)
                .averageTaskCompletionPercent(stats.getAverageTaskCompletionPercent())
                .traineeProgress(stats.getTraineeProgress())
                .currentWeekStart(weekStart)
                .atRiskCount(atRisk.size())
                .feedbackPendingCount(feedbackPending.size())
                .traineesWithOverdueTasksCount(overdueByTrainee.size())
                .atRisk(atRisk)
                .feedbackPending(feedbackPending)
                .overdueByTrainee(overdueByTrainee)
                .build();
    }

    private Double computeAverageSentimentScore(List<User> trainees) {
        if (trainees.isEmpty()) {
            return null;
        }
        double sum = 0;
        int count = 0;
        for (User trainee : trainees) {
            Optional<FeedbackResponse> latest = feedbackRepository
                    .findTopByTraineeIdOrderByWeekStartDesc(trainee.getId());
            if (latest.isPresent() && latest.get().getSentimentScore() != null) {
                sum += latest.get().getSentimentScore();
                count++;
            }
        }
        if (count == 0) {
            return null;
        }
        return Math.round((sum / count) * 10.0) / 10.0;
    }

    private List<TraineeOverdueTasksItem> buildOverdueByTrainee(List<User> trainees, LocalDate today) {
        if (trainees.isEmpty()) {
            return List.of();
        }
        List<Long> traineeIds = trainees.stream().map(User::getId).toList();
        List<TraineePlanTask> overdueTasks = taskRepository.findOverdueIncompleteByTraineeIds(traineeIds, today);

        Map<Long, List<OverdueTaskItem>> tasksByTrainee = new LinkedHashMap<>();
        Map<Long, String> namesByTrainee = new LinkedHashMap<>();
        for (TraineePlanTask task : overdueTasks) {
            Long traineeId = task.getTrainee().getId();
            namesByTrainee.put(traineeId, task.getTrainee().getFullName());
            tasksByTrainee.computeIfAbsent(traineeId, id -> new ArrayList<>())
                    .add(toOverdueTaskItem(task, today));
        }

        return tasksByTrainee.entrySet().stream()
                .map(entry -> TraineeOverdueTasksItem.builder()
                        .traineeId(entry.getKey())
                        .fullName(namesByTrainee.get(entry.getKey()))
                        .overdueCount(entry.getValue().size())
                        .tasks(entry.getValue())
                        .build())
                .toList();
    }

    private OverdueTaskItem toOverdueTaskItem(TraineePlanTask task, LocalDate today) {
        long daysOverdue = ChronoUnit.DAYS.between(task.getDeadline(), today);
        String description = task.getDescription();
        if (description.length() > 120) {
            description = description.substring(0, 117) + "...";
        }
        return OverdueTaskItem.builder()
                .taskId(task.getId())
                .description(description)
                .deadline(task.getDeadline())
                .daysOverdue(Math.max(1, daysOverdue))
                .build();
    }
}
