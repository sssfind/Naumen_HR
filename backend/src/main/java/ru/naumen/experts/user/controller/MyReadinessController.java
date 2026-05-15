package ru.naumen.experts.user.controller;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.user.dto.AddMyReadinessRequest;
import ru.naumen.experts.user.dto.UserProfileCardResponse;
import ru.naumen.experts.user.enums.ReadinessEventType;
import ru.naumen.experts.user.service.MyReadinessService;

@RestController
@RequestMapping("/api/v1/me/readiness")
@RequiredArgsConstructor
@Tag(name = "My readiness", description = "Готовность к форматам мероприятий в профиле текущего пользователя")
@SecurityRequirement(name = "bearerAuth")
public class MyReadinessController {

    private final MyReadinessService myReadinessService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Добавить готовность к формату")
    public ResponseEntity<UserProfileCardResponse> addMyReadiness(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @Valid @RequestBody AddMyReadinessRequest request) {
        return ResponseEntity.ok(myReadinessService.addMyReadiness(principal.getUserId(), request));
    }

    @DeleteMapping("/{readinessEventType}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Убрать готовность к формату из профиля")
    public ResponseEntity<Void> deleteMyReadiness(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable ReadinessEventType readinessEventType) {
        myReadinessService.deleteMyReadiness(principal.getUserId(), readinessEventType);
        return ResponseEntity.noContent().build();
    }
}
