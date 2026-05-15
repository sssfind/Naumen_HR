package ru.naumen.experts.skill.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.skill.dto.UpdateMySkillRequest;
import ru.naumen.experts.skill.dto.UpsertMySkillRequest;
import ru.naumen.experts.skill.service.MySkillsService;
import ru.naumen.experts.user.dto.UserProfileCardResponse;

@RestController
@RequestMapping("/api/v1/me/skills")
@RequiredArgsConstructor
@Tag(name = "My skills", description = "Редактирование навыков текущего пользователя")
@SecurityRequirement(name = "bearerAuth")
public class MySkillsController {

    private final MySkillsService mySkillsService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Добавить или обновить навык в профиле")
    public ResponseEntity<UserProfileCardResponse> upsertMySkill(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @Valid @RequestBody UpsertMySkillRequest request) {
        return ResponseEntity.ok(mySkillsService.upsertMySkill(principal.getUserId(), request));
    }

    @PutMapping("/{userSkillId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Обновить существующую запись навыка")
    public ResponseEntity<UserProfileCardResponse> updateMySkill(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long userSkillId,
            @Valid @RequestBody UpdateMySkillRequest request) {
        return ResponseEntity.ok(mySkillsService.updateMySkill(principal.getUserId(), userSkillId, request));
    }

    @DeleteMapping("/{userSkillId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Удалить навык из профиля")
    public ResponseEntity<Void> deleteMySkill(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long userSkillId) {
        mySkillsService.deleteMySkill(principal.getUserId(), userSkillId);
        return ResponseEntity.noContent().build();
    }
}
