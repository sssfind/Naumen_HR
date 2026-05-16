package ru.naumen.experts.chat.controller;

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
import ru.naumen.experts.chat.dto.ChatRequest;
import ru.naumen.experts.chat.dto.ChatResponse;
import ru.naumen.experts.chat.service.ChatService;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "Chat Bot", description = "Чат-бот NAU-START")
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "Задать вопрос чат-боту")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatResponse> ask(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.ask(request, principal.getRole()));
    }
}
