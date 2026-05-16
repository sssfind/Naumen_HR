package ru.naumen.experts.feedback.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import ru.naumen.experts.feedback.enums.ResourceIssue;
import ru.naumen.experts.feedback.enums.WeekRating;

import java.util.List;

@Data
public class SubmitFeedbackRequest {

    @NotNull(message = "Оцените рабочую неделю")
    private WeekRating weekRating;

    @NotNull(message = "Оцените понятность задач")
    @Min(value = 1, message = "Понятность задач: от 1 до 5")
    @Max(value = 5, message = "Понятность задач: от 1 до 5")
    private Integer tasksClarity;

    @NotEmpty(message = "Выберите хотя бы один вариант по доступам и ресурсам")
    private List<ResourceIssue> resourceIssues;

    @NotNull(message = "Оцените работу наставника")
    @Min(value = 1, message = "Оценка наставника: от 1 до 5")
    @Max(value = 5, message = "Оценка наставника: от 1 до 5")
    private Integer mentorRating;

    @Size(max = 2000, message = "Отзыв слишком длинный")
    private String weekComment;
}
