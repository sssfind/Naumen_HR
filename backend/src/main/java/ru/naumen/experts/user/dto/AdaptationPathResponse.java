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
