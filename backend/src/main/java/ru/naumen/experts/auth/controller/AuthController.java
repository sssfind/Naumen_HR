package ru.naumen.experts.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.naumen.experts.auth.dto.AuthResponse;
import ru.naumen.experts.auth.dto.LoginRequest;
import ru.naumen.experts.auth.dto.RegisterRequest;
import ru.naumen.experts.auth.dto.UserInfoResponse;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.auth.service.AuthService;
import ru.naumen.experts.exception.ErrorResponse;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Регистрация, вход и информация о текущем пользователе")
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Регистрация нового пользователя",
            description = "Допускается только корпоративная почта @naumen.ru. " +
                    "По умолчанию присваивается роль ROLE_EMPLOYEE."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Пользователь зарегистрирован"),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Некорпоративная почта",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Email уже занят",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Вход в систему",
            description = "Возвращает JWT-токен и redirectUrl в зависимости от роли пользователя. " +
                    "Допускается только корпоративная почта @naumen.ru."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Успешный вход"),
            @ApiResponse(responseCode = "401", description = "Неверные учётные данные",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Некорпоративная почта или аккаунт деактивирован",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Информация о текущем пользователе",
            description = "Требует Bearer JWT в заголовке Authorization.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Данные пользователя"),
            @ApiResponse(responseCode = "401", description = "Не авторизован",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserInfoResponse> getCurrentUser(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        UserInfoResponse response = authService.getCurrentUser(principal.getUserId());
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Выход из системы",
            description = "Для stateless JWT сервер не хранит сессию: клиент должен удалить токен. " +
                    "Эндпоинт пригоден для единообразного выхода и возможного расширения (чёрный список токенов).",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Успешный выход"),
            @ApiResponse(responseCode = "401", description = "Не авторизован",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
