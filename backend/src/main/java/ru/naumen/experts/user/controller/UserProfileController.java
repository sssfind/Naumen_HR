package ru.naumen.experts.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.user.dto.UpdateProfileRequest;
import ru.naumen.experts.user.dto.UserProfileResponse;
import ru.naumen.experts.user.service.UserProfileService;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Профиль текущего пользователя")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Operation(summary = "Получить профиль")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(userProfileService.getProfile(principal.getUserId()));
    }

    @Operation(summary = "Обновить профиль")
    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userProfileService.updateProfile(principal.getUserId(), request));
    }
}
