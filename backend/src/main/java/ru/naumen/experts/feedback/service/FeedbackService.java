package ru.naumen.experts.feedback.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.BadRequestException;
import ru.naumen.experts.exception.FeedbackAlreadySubmittedException;
import ru.naumen.experts.exception.ForbiddenException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.feedback.dto.FeedbackResponseDto;
import ru.naumen.experts.feedback.dto.FeedbackStatusResponse;
import ru.naumen.experts.feedback.dto.SubmitFeedbackRequest;
import ru.naumen.experts.feedback.entity.FeedbackResponse;
import ru.naumen.experts.feedback.enums.ResourceIssue;
import ru.naumen.experts.feedback.enums.WeekRating;
import ru.naumen.experts.feedback.repository.FeedbackResponseRepository;
import ru.naumen.experts.notification.enums.NotificationType;
import ru.naumen.experts.notification.service.NotificationService;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.repository.UserRepository;
import ru.naumen.experts.user.service.StaffAccessService;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private static final int RISK_CLARITY_THRESHOLD = 2;
    private static final int RISK_MENTOR_THRESHOLD = 2;

    private final FeedbackResponseRepository feedbackRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final StaffAccessService staffAccessService;

    @Transactional(readOnly = true)
    public FeedbackStatusResponse getStatus(Long traineeId) {
        requireTrainee(traineeId);
        LocalDate weekStart = currentWeekStart();

        FeedbackResponseDto currentWeek = feedbackRepository
                .findByTraineeIdAndWeekStart(traineeId, weekStart)
                .map(this::toDto)
                .orElse(null);

        FeedbackResponseDto last = feedbackRepository
                .findTopByTraineeIdOrderByWeekStartDesc(traineeId)
                .map(this::toDto)
                .orElse(null);

        boolean canSubmit = currentWeek == null;

        return FeedbackStatusResponse.builder()
                .currentWeekStart(weekStart)
                .canSubmitThisWeek(canSubmit)
                .dueThisWeek(canSubmit)
                .currentWeekResponse(currentWeek)
                .lastResponse(last)
                .build();
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getHistory(Long traineeId, int limit) {
        requireTrainee(traineeId);
        int size = Math.max(1, Math.min(limit, 52));
        return feedbackRepository
                .findByTraineeIdOrderByWeekStartDesc(traineeId, PageRequest.of(0, size))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getTraineeFeedbackForHr(Long staffId, Long traineeId, int limit) {
        User staff = staffAccessService.requireUser(staffId);
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));
        if (trainee.getRole() != UserRole.ROLE_TRAINEE) {
            throw new BadRequestException("Пользователь не является стажёром");
        }
        staffAccessService.requireCanViewTrainee(staff, trainee);

        int size = Math.max(1, Math.min(limit, 52));
        return feedbackRepository
                .findByTraineeIdOrderByWeekStartDesc(traineeId, PageRequest.of(0, size))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public FeedbackResponseDto submit(Long traineeId, SubmitFeedbackRequest request) {
        User trainee = requireTrainee(traineeId);
        LocalDate weekStart = currentWeekStart();

        if (feedbackRepository.existsByTraineeIdAndWeekStart(traineeId, weekStart)) {
            throw new FeedbackAlreadySubmittedException();
        }

        String encodedIssues = FeedbackResourceIssuesCodec.encode(request.getResourceIssues());

        FeedbackResponse entity = FeedbackResponse.builder()
                .trainee(trainee)
                .weekStart(weekStart)
                .weekRating(request.getWeekRating())
                .tasksClarity(request.getTasksClarity())
                .resourceIssues(encodedIssues)
                .mentorRating(request.getMentorRating())
                .weekComment(emptyToNull(request.getWeekComment()))
                .build();

        FeedbackResponse saved = feedbackRepository.save(entity);

        trainee.setMoodLevel(mapWeekRatingToMood(request.getWeekRating()));
        userRepository.save(trainee);

        notifyHrOnFeedback(trainee, saved);

        notificationService.createNotification(
                traineeId,
                "Опрос отправлен",
                request.getWeekRating() == WeekRating.NEED_HELP
                        ? "Спасибо! HR свяжется с вами в ближайшее время."
                        : "Спасибо! Ваш еженедельный опрос сохранён.",
                NotificationType.FEEDBACK_SUBMITTED
        );

        return toDto(saved);
    }

    private void notifyHrOnFeedback(User trainee, FeedbackResponse feedback) {
        List<User> hrRecipients = trainee.getHr() != null
                ? List.of(trainee.getHr())
                : userRepository.findByRoleAndIsActiveTrue(UserRole.ROLE_HR);

        String traineeName = trainee.getFullName();
        for (User hr : hrRecipients) {
            notificationService.createNotification(
                    hr.getId(),
                    "Новый опрос стажёра",
                    traineeName + " заполнил еженедельный опрос обратной связи.",
                    NotificationType.FEEDBACK_SUBMITTED
            );

            if (isRiskSignal(feedback)) {
                String details = buildRiskDetails(feedback);
                notificationService.createNotification(
                        hr.getId(),
                        feedback.getWeekRating() == WeekRating.NEED_HELP
                                ? "Срочно: стажёр просит помощи"
                                : "Внимание: риск по адаптации",
                        traineeName + ": " + details,
                        NotificationType.FEEDBACK_RISK
                );
            }
        }
    }

    private boolean isRiskSignal(FeedbackResponse feedback) {
        WeekRating rating = feedback.getWeekRating();
        if (rating == WeekRating.STRESSED || rating == WeekRating.NEED_HELP) {
            return true;
        }
        if (feedback.getTasksClarity() <= RISK_CLARITY_THRESHOLD) {
            return true;
        }
        if (feedback.getMentorRating() <= RISK_MENTOR_THRESHOLD) {
            return true;
        }
        List<ResourceIssue> issues = FeedbackResourceIssuesCodec.decode(feedback.getResourceIssues());
        return issues.stream().anyMatch(issue -> issue != ResourceIssue.ALL_OK);
    }

    private String buildRiskDetails(FeedbackResponse feedback) {
        StringBuilder sb = new StringBuilder();
        WeekRating rating = feedback.getWeekRating();
        if (rating == WeekRating.NEED_HELP) {
            sb.append("запрошена помощь HR");
        } else if (rating == WeekRating.STRESSED) {
            sb.append("тяжёлая неделя, стресс");
        }
        if (feedback.getTasksClarity() <= RISK_CLARITY_THRESHOLD) {
            appendDetail(sb, "задачи непонятны (" + feedback.getTasksClarity() + "/5)");
        }
        if (feedback.getMentorRating() <= RISK_MENTOR_THRESHOLD) {
            appendDetail(sb, "низкая оценка наставника (" + feedback.getMentorRating() + "/5)");
        }
        List<ResourceIssue> issues = FeedbackResourceIssuesCodec.decode(feedback.getResourceIssues());
        if (issues.stream().anyMatch(issue -> issue != ResourceIssue.ALL_OK)) {
            appendDetail(sb, "проблемы с доступами или ресурсами");
        }
        return sb.toString();
    }

    private void appendDetail(StringBuilder sb, String detail) {
        if (!sb.isEmpty()) {
            sb.append(", ");
        }
        sb.append(detail);
    }

    private int mapWeekRatingToMood(WeekRating rating) {
        return switch (rating) {
            case EXCELLENT -> 5;
            case GOOD -> 4;
            case OKAY_DIFFICULT -> 3;
            case STRESSED -> 2;
            case NEED_HELP -> 1;
        };
    }

    private User requireTrainee(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        if (user.getRole() != UserRole.ROLE_TRAINEE) {
            throw new ForbiddenException("Доступно только для стажёров");
        }
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Учётная запись деактивирована");
        }
        return user;
    }

    static LocalDate currentWeekStart() {
        return LocalDate.now().with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private FeedbackResponseDto toDto(FeedbackResponse entity) {
        return FeedbackResponseDto.builder()
                .id(entity.getId())
                .weekStart(entity.getWeekStart())
                .weekRating(entity.getWeekRating())
                .tasksClarity(entity.getTasksClarity())
                .resourceIssues(FeedbackResourceIssuesCodec.decode(entity.getResourceIssues()))
                .mentorRating(entity.getMentorRating())
                .weekComment(entity.getWeekComment())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private String emptyToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
