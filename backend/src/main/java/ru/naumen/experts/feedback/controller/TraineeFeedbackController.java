package ru.naumen.experts.feedback.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.feedback.dto.FeedbackResponseDto;
import ru.naumen.experts.feedback.dto.FeedbackStatusResponse;
import ru.naumen.experts.feedback.dto.SubmitFeedbackRequest;
import ru.naumen.experts.feedback.service.FeedbackService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/trainee/feedback")
@RequiredArgsConstructor
@Tag(name = "Trainee Feedback", description = "Еженедельная обратная связь стажёра")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('TRAINEE')")
public class TraineeFeedbackController {

    private final FeedbackService feedbackService;

    @Operation(summary = "Статус еженедельного опроса")
    @GetMapping("/status")
    public ResponseEntity<FeedbackStatusResponse> getStatus(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal) {
        return ResponseEntity.ok(feedbackService.getStatus(principal.getUserId()));
    }

    @Operation(summary = "История опросов")
    @GetMapping
    public ResponseEntity<List<FeedbackResponseDto>> getHistory(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(feedbackService.getHistory(principal.getUserId(), limit));
    }

    @Operation(summary = "Отправить еженедельный опрос")
    @PostMapping
    public ResponseEntity<FeedbackResponseDto> submit(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @Valid @RequestBody SubmitFeedbackRequest request) {
        FeedbackResponseDto response = feedbackService.submit(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
