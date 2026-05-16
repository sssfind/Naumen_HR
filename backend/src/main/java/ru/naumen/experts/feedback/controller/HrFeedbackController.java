package ru.naumen.experts.feedback.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.feedback.dto.FeedbackResponseDto;
import ru.naumen.experts.feedback.service.FeedbackService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/trainees/{traineeId}/feedback")
@RequiredArgsConstructor
@Tag(name = "HR Feedback", description = "Обратная связь стажёров для HR")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('HR')")
public class HrFeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "История еженедельных опросов стажёра")
    @GetMapping
    public ResponseEntity<List<FeedbackResponseDto>> getTraineeFeedback(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long traineeId,
            @RequestParam(defaultValue = "12") int limit) {
        return ResponseEntity.ok(
                feedbackService.getTraineeFeedbackForHr(principal.getUserId(), traineeId, limit));
    }
}
