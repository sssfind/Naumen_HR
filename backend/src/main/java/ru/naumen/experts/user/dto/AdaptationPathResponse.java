package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class AdaptationPathResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private int totalWeeks;
    private int currentWeek;
    private String currentPhaseId;
    private List<AdaptationPathPhaseDto> phases;
    private List<AdaptationPathMilestoneDto> milestones;
    /** Понедельные сегменты шкалы: цвет зависит от выполненных задач */
    private List<AdaptationPathWeekDto> weeks;

    @Data
    @Builder
    public static class AdaptationPathWeekDto {
        private int weekNumber;
        private List<AdaptationPathWeekSliceDto> slices;
    }

    @Data
    @Builder
    public static class AdaptationPathWeekSliceDto {
        private Long taskId;
        private String blockId;
        private String blockTitle;
        /** NOT_STARTED | IN_PROGRESS | COMPLETED */
        private String status;
        private boolean overdue;
    }

    @Data
    @Builder
    public static class AdaptationPathPhaseDto {
        private String id;
        private String title;
        private int weekFrom;
        private int weekTo;
        private int progress;
        /** UPCOMING | CURRENT | COMPLETED */
        private String status;
    }

    @Data
    @Builder
    public static class AdaptationPathMilestoneDto {
        private Long taskId;
        private String title;
        private String blockId;
        private String blockTitle;
        private int weekNumber;
        private LocalDate deadline;
        /** NOT_STARTED | IN_PROGRESS | COMPLETED */
        private String status;
        private boolean overdue;
    }
}
