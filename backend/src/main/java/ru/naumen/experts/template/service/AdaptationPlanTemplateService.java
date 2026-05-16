package ru.naumen.experts.template.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.BadRequestException;
import ru.naumen.experts.exception.ForbiddenException;
import ru.naumen.experts.exception.TemplateNotFoundException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.template.dto.*;
import ru.naumen.experts.template.entity.AdaptationPlanTemplate;
import ru.naumen.experts.template.entity.AdaptationPlanTemplateTask;
import ru.naumen.experts.template.mapper.PlanTemplateMapper;
import ru.naumen.experts.template.repository.AdaptationPlanTemplateRepository;
import ru.naumen.experts.template.repository.AdaptationPlanTemplateTaskRepository;
import ru.naumen.experts.traineeplan.entity.TraineePlanTask;
import ru.naumen.experts.traineeplan.repository.TraineePlanTaskRepository;
import ru.naumen.experts.traineeplan.service.TraineePlanService;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdaptationPlanTemplateService {

    private final AdaptationPlanTemplateRepository templateRepository;
    private final AdaptationPlanTemplateTaskRepository templateTaskRepository;
    private final TraineePlanTaskRepository traineeTaskRepository;
    private final TraineePlanService traineePlanService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PlanTemplateSummaryResponse> listForHr(Long hrId) {
        requireHr(hrId);
        return templateRepository.findAvailableForHr(hrId).stream()
                .map(template -> PlanTemplateSummaryResponse.builder()
                        .id(template.getId())
                        .name(template.getName())
                        .description(template.getDescription())
                        .targetPosition(template.getTargetPosition())
                        .durationWeeks(template.getDurationWeeks())
                        .system(template.isSystem())
                        .taskCount((int) templateTaskRepository.countByTemplateId(template.getId()))
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public PlanTemplateDetailResponse getForHr(Long hrId, Long templateId) {
        requireHr(hrId);
        AdaptationPlanTemplate template = requireTemplateForHr(hrId, templateId);
        List<AdaptationPlanTemplateTask> tasks =
                templateTaskRepository.findByTemplateIdOrderBySortOrderAscIdAsc(templateId);
        return PlanTemplateMapper.toDetail(template, tasks);
    }

    @Transactional
    public PlanTemplateDetailResponse createTemplate(Long hrId, PlanTemplateRequest request) {
        User hr = requireHr(hrId);
        AdaptationPlanTemplate template = AdaptationPlanTemplate.builder()
                .name(request.getName().trim())
                .description(request.getDescription().trim())
                .targetPosition(trimOrNull(request.getTargetPosition()))
                .durationWeeks(request.getDurationWeeks() != null ? request.getDurationWeeks() : 12)
                .system(false)
                .createdByHr(hr)
                .build();
        template = templateRepository.save(template);
        return PlanTemplateMapper.toDetail(template, List.of());
    }

    @Transactional
    public PlanTemplateDetailResponse updateTemplate(Long hrId, Long templateId, PlanTemplateRequest request) {
        requireHr(hrId);
        AdaptationPlanTemplate template = requireOwnedTemplate(hrId, templateId);
        template.setName(request.getName().trim());
        template.setDescription(request.getDescription().trim());
        template.setTargetPosition(trimOrNull(request.getTargetPosition()));
        if (request.getDurationWeeks() != null) {
            template.setDurationWeeks(request.getDurationWeeks());
        }
        templateRepository.save(template);
        return getForHr(hrId, templateId);
    }

    @Transactional
    public void deleteTemplate(Long hrId, Long templateId) {
        requireHr(hrId);
        AdaptationPlanTemplate template = requireOwnedTemplate(hrId, templateId);
        templateRepository.delete(template);
    }

    @Transactional
    public PlanTemplateTaskResponse createTask(Long hrId, Long templateId, PlanTemplateTaskRequest request) {
        requireHr(hrId);
        AdaptationPlanTemplate template = requireOwnedTemplate(hrId, templateId);
        AdaptationPlanTemplateTask task = buildTask(template, request);
        return PlanTemplateMapper.toTaskResponse(templateTaskRepository.save(task));
    }

    @Transactional
    public PlanTemplateTaskResponse updateTask(
            Long hrId, Long templateId, Long taskId, PlanTemplateTaskRequest request) {
        requireHr(hrId);
        requireOwnedTemplate(hrId, templateId);
        AdaptationPlanTemplateTask task = templateTaskRepository
                .findByIdAndTemplateId(taskId, templateId)
                .orElseThrow(() -> new TemplateNotFoundException(templateId));
        applyTaskFields(task, request);
        return PlanTemplateMapper.toTaskResponse(templateTaskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long hrId, Long templateId, Long taskId) {
        requireHr(hrId);
        requireOwnedTemplate(hrId, templateId);
        AdaptationPlanTemplateTask task = templateTaskRepository
                .findByIdAndTemplateId(taskId, templateId)
                .orElseThrow(() -> new TemplateNotFoundException(templateId));
        templateTaskRepository.delete(task);
    }

    @Transactional
    public ApplyPlanTemplateResponse applyToTrainee(
            Long hrId, Long traineeId, Long templateId, ApplyPlanTemplateRequest request) {
        requireHr(hrId);
        traineePlanService.requireAssignedTraineeForApply(hrId, traineeId);
        AdaptationPlanTemplate template = requireTemplateForHr(hrId, templateId);
        List<AdaptationPlanTemplateTask> templateTasks =
                templateTaskRepository.findByTemplateIdOrderBySortOrderAscIdAsc(templateId);
        if (templateTasks.isEmpty()) {
            throw new BadRequestException("Шаблон не содержит задач");
        }

        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new UserNotFoundException(traineeId));

        boolean replaceExisting = request != null && request.isReplaceExisting();
        if (replaceExisting) {
            traineeTaskRepository.deleteByTraineeId(traineeId);
        }

        LocalDate startDate = request != null && request.getStartDate() != null
                ? request.getStartDate()
                : LocalDate.now();

        for (AdaptationPlanTemplateTask templateTask : templateTasks) {
            TraineePlanTask task = TraineePlanTask.builder()
                    .trainee(trainee)
                    .block(templateTask.getBlock())
                    .description(templateTask.getDescription())
                    .deadline(startDate.plusDays(templateTask.getDaysFromStart()))
                    .priority(templateTask.getPriority())
                    .acceptanceCriteria(templateTask.getAcceptanceCriteria())
                    .acceptanceCheckType(templateTask.getAcceptanceCheckType())
                    .build();
            traineeTaskRepository.save(task);
        }

        return ApplyPlanTemplateResponse.builder()
                .templateId(templateId)
                .templateName(template.getName())
                .tasksCreated(templateTasks.size())
                .build();
    }

    private AdaptationPlanTemplateTask buildTask(AdaptationPlanTemplate template, PlanTemplateTaskRequest request) {
        AdaptationPlanTemplateTask task = AdaptationPlanTemplateTask.builder()
                .template(template)
                .build();
        applyTaskFields(task, request);
        if (task.getSortOrder() == null) {
            int nextOrder = templateTaskRepository.findByTemplateIdOrderBySortOrderAscIdAsc(template.getId())
                    .size();
            task.setSortOrder(nextOrder);
        }
        return task;
    }

    private void applyTaskFields(AdaptationPlanTemplateTask task, PlanTemplateTaskRequest request) {
        task.setBlock(request.getBlock());
        task.setDescription(request.getDescription().trim());
        task.setAcceptanceCriteria(request.getAcceptanceCriteria().trim());
        task.setPriority(request.getPriority());
        task.setAcceptanceCheckType(request.getAcceptanceCheckType());
        task.setDaysFromStart(request.getDaysFromStart());
        if (request.getSortOrder() != null) {
            task.setSortOrder(request.getSortOrder());
        }
    }

    private AdaptationPlanTemplate requireTemplateForHr(Long hrId, Long templateId) {
        return templateRepository.findByIdForHr(templateId, hrId)
                .orElseThrow(() -> new TemplateNotFoundException(templateId));
    }

    private AdaptationPlanTemplate requireOwnedTemplate(Long hrId, Long templateId) {
        AdaptationPlanTemplate template = requireTemplateForHr(hrId, templateId);
        if (template.isSystem()) {
            throw new ForbiddenException("Системные шаблоны нельзя изменять");
        }
        if (template.getCreatedByHr() == null || !template.getCreatedByHr().getId().equals(hrId)) {
            throw new ForbiddenException("Нет доступа к этому шаблону");
        }
        return template;
    }

    private User requireHr(Long hrId) {
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new UserNotFoundException(hrId));
        if (hr.getRole() != UserRole.ROLE_HR) {
            throw new ForbiddenException("Доступно только для HR");
        }
        return hr;
    }

    private static String trimOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
