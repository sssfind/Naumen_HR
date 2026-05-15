package ru.naumen.experts.expert.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.expert.dto.ExpertResponseDTO;
import ru.naumen.experts.expert.dto.ExpertSearchCriteriaDTO;
import ru.naumen.experts.expert.dto.ExpertSortMode;
import ru.naumen.experts.expert.service.ExpertSearchService;
import ru.naumen.experts.user.enums.ReadinessEventType;

import java.util.List;

@RestController
@RequestMapping("/api/v1/experts")
@RequiredArgsConstructor
@Tag(name = "Expert Search", description = "Поиск экспертов по навыкам и готовности")
@SecurityRequirement(name = "bearerAuth")
public class ExpertSearchController {

    private final ExpertSearchService expertSearchService;

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Поиск экспертов",
            description = "Фильтрация по ID hard-навыков, ID expert-навыков и статусам готовности. Все параметры необязательны. Внутри категории — OR, между категориями — AND."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список экспертов"),
            @ApiResponse(responseCode = "400", description = "Невалидный параметр"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    public ResponseEntity<Page<ExpertResponseDTO>> searchExperts(
            @Parameter(description = "Текстовый поиск по ФИО, отделу и навыкам")
            @RequestParam(required = false) String query,

            @Parameter(description = "ID профессиональных навыков из /api/v1/dictionaries/hard-skills")
            @RequestParam(required = false) List<Long> hardSkillIds,

            @Parameter(description = "ID экспертных навыков из /api/v1/dictionaries/expert-skills")
            @RequestParam(required = false) List<Long> expertSkillIds,

            @Parameter(description = "Статусы готовности (можно несколько): MENTORSHIP, PUBLIC_SPEAKING, JURY_WORK, WORKSHOP_FACILITATION, LECTURE_DELIVERY, HACKATHON_PARTICIPATION, EVENT_ORGANIZATION")
            @RequestParam(required = false) List<ReadinessEventType> readinessStatuses,

            @Parameter(description = "Сортировка результатов: RECOMMEND_NEWCOMERS, SELECTED_STARS_DESC, SELECTED_STARS_ASC")
            @RequestParam(required = false) ExpertSortMode sortMode,

            @ParameterObject @PageableDefault(size = 20, sort = "fullName") Pageable pageable,
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {

        ExpertSearchCriteriaDTO criteria = new ExpertSearchCriteriaDTO();
        criteria.setQuery(query);
        criteria.setHardSkillIds(hardSkillIds);
        criteria.setExpertSkillIds(expertSkillIds);
        criteria.setReadinessStatuses(readinessStatuses);
        criteria.setSortMode(sortMode != null ? sortMode : ExpertSortMode.RECOMMEND_NEWCOMERS);

        Page<ExpertResponseDTO> result = expertSearchService.searchExperts(criteria, pageable, principal.getUserId());
        return ResponseEntity.ok(result);
    }
}
