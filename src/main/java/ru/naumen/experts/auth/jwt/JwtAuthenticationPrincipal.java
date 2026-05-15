package ru.naumen.experts.auth.jwt;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JwtAuthenticationPrincipal {

    private final Long userId;
    private final String email;
    private final String role;
}
