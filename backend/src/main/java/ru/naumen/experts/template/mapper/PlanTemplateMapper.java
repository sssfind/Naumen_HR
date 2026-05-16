package ru.naumen.experts.template.mapper;

import ru.naumen.experts.template.dto.PlanTemplateDetailResponse;
import ru.naumen.experts.template.dto.PlanTemplateSummaryResponse;
import ru.naumen.experts.template.dto.PlanTemplateTaskResponse;
import ru.naumen.experts.template.entity.AdaptationPlanTemplate;
import ru.naumen.experts.template.entity.AdaptationPlanTemplateTask;
import ru.naumen.experts.traineeplan.enums.TraineePlanBlock;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class PlanTemplateMapper {

    private PlanTemplateMapper() {
    }

    public static PlanTemplateSummaryResponse toSummary(AdaptationPlanTemplate template) {
        return PlanTemplateSummaryResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .targetPosition(template.getTargetPosition())
                .durationWeeks(template.getDurationWeeks())
                .system(template.isSystem())
                .taskCount(template.getTasks() != null ? template.getTasks().size() : 0)
                .build();
    }

    public static PlanTemplateDetailResponse toDetail(AdaptationPlanTemplate template, List<AdaptationPlanTemplateTask> tasks) {
        Map<TraineePlanBlock, List<PlanTemplateTaskResponse>> byBlock = tasks.stream()
                .map(PlanTemplateMapper::toTaskResponse)
                .collect(Collectors.groupingBy(PlanTemplateTaskResponse::getBlock));

        return PlanTemplateDetailResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .targetPosition(template.getTargetPosition())
                .durationWeeks(template.getDurationWeeks())
                .system(template.isSystem())
                .blocks(Arrays.stream(TraineePlanBlock.values())
                        .map(block -> PlanTemplateDetailResponse.PlanTemplateBlockResponse.builder()
                                .id(block.getId())
                                .title(block.getTitle())
                                .tasks(byBlock.getOrDefault(block, List.of()))
                                .build())
                        .toList())
                .build();
    }

    public static PlanTemplateTaskResponse toTaskResponse(AdaptationPlanTemplateTask task) {
        return PlanTemplateTaskResponse.builder()
                .id(task.getId())
                .block(task.getBlock())
                .blockId(task.getBlock().getId())
                .description(task.getDescription())
                .acceptanceCriteria(task.getAcceptanceCriteria())
                .priority(task.getPriority())
                .acceptanceCheckType(task.getAcceptanceCheckType())
                .daysFromStart(task.getDaysFromStart())
                .sortOrder(task.getSortOrder())
                .milestone(task.isMilestone())
                .build();
    }
}
