package ru.naumen.experts.traineeplan.service;

import org.springframework.stereotype.Service;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.enums.TaskStatus;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;
import ru.naumen.experts.user.dto.AdaptationPathResponse;
import ru.naumen.experts.user.dto.AdaptationPathResponse.AdaptationPathMilestoneDto;
import ru.naumen.experts.user.dto.AdaptationPathResponse.AdaptationPathPhaseDto;
import ru.naumen.experts.user.dto.AdaptationPathResponse.AdaptationPathWeekDto;
import ru.naumen.experts.user.dto.AdaptationPathResponse.AdaptationPathWeekSliceDto;
import ru.naumen.experts.user.entity.User;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdaptationPathService {

    private static final int DEFAULT_DURATION_WEEKS = 12;
    private static final int INFERRED_START_OFFSET_DAYS = 7;

    private static final List<TraineePlanBlock> PHASE_ORDER = List.of(
            TraineePlanBlock.ONBOARDING,
            TraineePlanBlock.SKILLS,
            TraineePlanBlock.WORK
    );

    public AdaptationPathResponse build(User trainee, List<TraineePlanTask> tasks) {
        LocalDate startDate = resolveStartDate(trainee, tasks);
        LocalDate endDate = resolveEndDate(startDate, tasks);
        int totalWeeks = Math.max(DEFAULT_DURATION_WEEKS, weekIndex(startDate, endDate));
        int currentWeek = Math.max(1, Math.min(totalWeeks, weekIndex(startDate, LocalDate.now())));

        Map<TraineePlanBlock, List<TraineePlanTask>> byBlock = tasks.stream()
                .collect(Collectors.groupingBy(TraineePlanTask::getBlock, () -> new EnumMap<>(TraineePlanBlock.class),
                        Collectors.toList()));

        List<AdaptationPathPhaseDto> phases = buildPhases(startDate, totalWeeks, currentWeek, byBlock);
        String currentPhaseId = phases.stream()
                .filter(p -> "CURRENT".equals(p.getStatus()))
                .map(AdaptationPathPhaseDto::getId)
                .findFirst()
                .orElse(phases.isEmpty() ? "onboarding" : phases.get(phases.size() - 1).getId());

        List<AdaptationPathMilestoneDto> milestones = tasks.stream()
                .filter(TraineePlanTask::isMilestone)
                .sorted(Comparator.comparing(TraineePlanTask::getDeadline).thenComparing(TraineePlanTask::getId))
                .map(task -> toMilestone(task, startDate))
                .toList();

        List<AdaptationPathWeekDto> weeks = buildWeeks(startDate, totalWeeks, tasks);

        return AdaptationPathResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalWeeks(totalWeeks)
                .currentWeek(currentWeek)
                .currentPhaseId(currentPhaseId)
                .phases(phases)
                .milestones(milestones)
                .weeks(weeks)
                .build();
    }

    private List<AdaptationPathWeekDto> buildWeeks(LocalDate startDate, int totalWeeks, List<TraineePlanTask> tasks) {
        LocalDate today = LocalDate.now();
        Map<Integer, List<TraineePlanTask>> tasksByWeek = tasks.stream()
                .collect(Collectors.groupingBy(
                        t -> weekIndex(startDate, t.getDeadline()),
                        () -> new java.util.TreeMap<>(),
                        Collectors.toList()));

        List<AdaptationPathWeekDto> weeks = new ArrayList<>();
        for (int week = 1; week <= totalWeeks; week++) {
            List<TraineePlanTask> weekTasks = tasksByWeek.getOrDefault(week, List.of());
            List<AdaptationPathWeekSliceDto> slices = weekTasks.stream()
                    .sorted(Comparator.comparing(TraineePlanTask::getDeadline).thenComparing(TraineePlanTask::getId))
                    .map(task -> toWeekSlice(task, today))
                    .toList();
            weeks.add(AdaptationPathWeekDto.builder()
                    .weekNumber(week)
                    .slices(slices)
                    .build());
        }
        return weeks;
    }

    private AdaptationPathWeekSliceDto toWeekSlice(TraineePlanTask task, LocalDate today) {
        TaskStatus status = task.getStatus() != null ? task.getStatus() : TaskStatus.NOT_STARTED;
        boolean overdue = status != TaskStatus.COMPLETED && task.getDeadline().isBefore(today);
        return AdaptationPathWeekSliceDto.builder()
                .taskId(task.getId())
                .blockId(task.getBlock().getId())
                .blockTitle(task.getBlock().getTitle())
                .status(status.name())
                .overdue(overdue)
                .build();
    }

    private List<AdaptationPathPhaseDto> buildPhases(
            LocalDate startDate,
            int totalWeeks,
            int currentWeek,
            Map<TraineePlanBlock, List<TraineePlanTask>> byBlock) {
        List<AdaptationPathPhaseDto> phases = new ArrayList<>();
        int defaultWeekSpan = Math.max(1, totalWeeks / PHASE_ORDER.size());
        int cursor = 1;

        for (TraineePlanBlock block : PHASE_ORDER) {
            List<TraineePlanTask> blockTasks = byBlock.getOrDefault(block, List.of());
            int weekFrom;
            int weekTo;
            int progress;

            if (blockTasks.isEmpty()) {
                weekFrom = cursor;
                weekTo = Math.min(totalWeeks, cursor + defaultWeekSpan - 1);
                progress = 0;
            } else {
                weekFrom = blockTasks.stream()
                        .mapToInt(t -> weekIndex(startDate, t.getDeadline()))
                        .min()
                        .orElse(cursor);
                weekTo = blockTasks.stream()
                        .mapToInt(t -> weekIndex(startDate, t.getDeadline()))
                        .max()
                        .orElse(weekFrom);
                long completed = blockTasks.stream()
                        .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                        .count();
                progress = (int) Math.round(completed * 100.0 / blockTasks.size());
            }

            weekFrom = Math.max(1, Math.min(weekFrom, totalWeeks));
            weekTo = Math.max(weekFrom, Math.min(weekTo, totalWeeks));
            String status = phaseStatus(weekFrom, weekTo, currentWeek, progress);

            phases.add(AdaptationPathPhaseDto.builder()
                    .id(block.getId())
                    .title(block.getTitle())
                    .weekFrom(weekFrom)
                    .weekTo(weekTo)
                    .progress(progress)
                    .status(status)
                    .build());

            cursor = weekTo + 1;
        }
        return phases;
    }

    private static String phaseStatus(int weekFrom, int weekTo, int currentWeek, int progress) {
        if (progress >= 100) {
            return "COMPLETED";
        }
        if (currentWeek < weekFrom) {
            return "UPCOMING";
        }
        if (currentWeek <= weekTo) {
            return "CURRENT";
        }
        return "CURRENT";
    }

    private AdaptationPathMilestoneDto toMilestone(TraineePlanTask task, LocalDate startDate) {
        LocalDate today = LocalDate.now();
        TaskStatus status = task.getStatus() != null ? task.getStatus() : TaskStatus.NOT_STARTED;
        boolean overdue = status != TaskStatus.COMPLETED && task.getDeadline().isBefore(today);

        return AdaptationPathMilestoneDto.builder()
                .taskId(task.getId())
                .title(task.getDescription())
                .blockId(task.getBlock().getId())
                .blockTitle(task.getBlock().getTitle())
                .weekNumber(weekIndex(startDate, task.getDeadline()))
                .deadline(task.getDeadline())
                .status(status.name())
                .overdue(overdue)
                .build();
    }

    private LocalDate resolveStartDate(User trainee, List<TraineePlanTask> tasks) {
        if (trainee.getAdaptationStartDate() != null) {
            return trainee.getAdaptationStartDate();
        }
        if (!tasks.isEmpty()) {
            LocalDate earliest = tasks.stream()
                    .map(TraineePlanTask::getDeadline)
                    .min(LocalDate::compareTo)
                    .orElse(LocalDate.now());
            return earliest.minusDays(INFERRED_START_OFFSET_DAYS);
        }
        return trainee.getCreatedAt() != null
                ? trainee.getCreatedAt().toLocalDate()
                : LocalDate.now();
    }

    private LocalDate resolveEndDate(LocalDate startDate, List<TraineePlanTask> tasks) {
        if (!tasks.isEmpty()) {
            LocalDate latest = tasks.stream()
                    .map(TraineePlanTask::getDeadline)
                    .max(LocalDate::compareTo)
                    .orElse(startDate.plusWeeks(DEFAULT_DURATION_WEEKS));
            LocalDate minEnd = startDate.plusWeeks(DEFAULT_DURATION_WEEKS).minusDays(1);
            return latest.isAfter(minEnd) ? latest : minEnd;
        }
        return startDate.plusWeeks(DEFAULT_DURATION_WEEKS).minusDays(1);
    }

    private static int weekIndex(LocalDate startDate, LocalDate date) {
        if (date.isBefore(startDate)) {
            return 1;
        }
        long days = ChronoUnit.DAYS.between(startDate, date);
        return (int) (days / 7) + 1;
    }
}
