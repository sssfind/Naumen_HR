package ru.naumen.experts.dictionary.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.dictionary.dto.ReadinessStatusDto;
import ru.naumen.experts.dictionary.dto.SkillDictionaryDto;
import ru.naumen.experts.dictionary.service.DictionaryService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dictionaries")
@RequiredArgsConstructor
@Tag(name = "Dictionaries", description = "Справочники для заполнения форм фильтрации")
@SecurityRequirement(name = "bearerAuth")
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping("/hard-skills")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Список профессиональных (hard) навыков")
    public ResponseEntity<List<SkillDictionaryDto>> getHardSkills() {
        return ResponseEntity.ok(dictionaryService.getHardSkills());
    }

    @GetMapping("/expert-skills")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Список экспертных (soft/expert) навыков")
    public ResponseEntity<List<SkillDictionaryDto>> getExpertSkills() {
        return ResponseEntity.ok(dictionaryService.getExpertSkills());
    }

    @GetMapping("/readiness-statuses")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Список статусов готовности с читаемыми метками")
    public ResponseEntity<List<ReadinessStatusDto>> getReadinessStatuses() {
        return ResponseEntity.ok(dictionaryService.getReadinessStatuses());
    }
}
