package ru.naumen.experts.skill.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.naumen.experts.auth.jwt.JwtAuthenticationPrincipal;
import ru.naumen.experts.skill.dto.PeerSkillStarResponse;
import ru.naumen.experts.skill.service.PeerSkillStarService;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Peer skill stars", description = "Звёзды за навыки от коллег")
@SecurityRequirement(name = "bearerAuth")
public class PeerSkillStarController {

    private final PeerSkillStarService peerSkillStarService;

    @PostMapping("/{userId}/skills/{userSkillId}/peer-star")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Поставить звезду навыку другого пользователя (один раз на навык)")
    public ResponseEntity<PeerSkillStarResponse> givePeerStar(
            @AuthenticationPrincipal JwtAuthenticationPrincipal principal,
            @PathVariable Long userId,
            @PathVariable Long userSkillId) {
        return ResponseEntity.ok(peerSkillStarService.givePeerStar(principal.getUserId(), userId, userSkillId));
    }
}
