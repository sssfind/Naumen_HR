package ru.naumen.experts.invitation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.invitation.dto.InvitationRequest;
import ru.naumen.experts.invitation.dto.InvitationResponse;
import ru.naumen.experts.invitation.service.InvitationService;

@RestController
@RequestMapping("/api/v1/invitations")
@RequiredArgsConstructor
@Tag(name = "Invitations", description = "Управление приглашениями пользователей на мероприятия")
@SecurityRequirement(name = "bearerAuth")
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Отправить приглашение на мероприятие",
            description = "Доступно любому аутентифицированному пользователю"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Приглашение на мероприятие отправлено"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    public ResponseEntity<InvitationResponse> invite(
            @Valid @RequestBody InvitationRequest request,
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {

        InvitationResponse response = invitationService.invite(request, principal.getUserId());
        return ResponseEntity.ok(response);
    }
}
