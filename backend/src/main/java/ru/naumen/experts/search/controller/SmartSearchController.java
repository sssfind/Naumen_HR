package ru.naumen.experts.search.controller;

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
import ru.naumen.experts.search.dto.SmartSearchRequest;
import ru.naumen.experts.search.dto.SmartSearchResponse;
import ru.naumen.experts.search.service.SmartSearchService;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "Smart Search", description = "ИИ-поиск сотрудников по запросу")
@SecurityRequirement(name = "bearerAuth")
public class SmartSearchController {

    private final SmartSearchService smartSearchService;

    @PostMapping("/smart")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Умный ИИ-поиск сотрудников")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Поиск выполнен успешно"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    public ResponseEntity<SmartSearchResponse> smartSearch(
            @Valid @RequestBody SmartSearchRequest request,
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        SmartSearchResponse response = smartSearchService.search(
                request.getQuery(),
                request.getTags(),
                principal.getUserId()
        );
        return ResponseEntity.ok(response);
    }
}
