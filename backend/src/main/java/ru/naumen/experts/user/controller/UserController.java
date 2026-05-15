package ru.naumen.experts.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.user.dto.UserProfileCardResponse;
import ru.naumen.experts.user.dto.UserProfileResponse;
import ru.naumen.experts.user.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Управление профилями пользователей")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Получить расширенный профиль текущего пользователя")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Профиль успешно получен"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(userService.getProfile(principal.getUserId()));
    }

    @GetMapping("/me/card")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Полная карточка текущего пользователя (профиль, навыки, мероприятия, готовность)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Карточка успешно получена"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    public ResponseEntity<UserProfileCardResponse> getMyCard(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(userService.getProfileCard(principal.getUserId()));
    }

    @GetMapping("/by-id/{userId}/card")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Полная карточка пользователя по id (навыки, мероприятия, готовность) — для просмотра из поиска экспертов")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Карточка успешно получена"),
            @ApiResponse(responseCode = "401", description = "Не авторизован"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    public ResponseEntity<UserProfileCardResponse> getUserCard(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getProfileCard(userId));
    }
}
