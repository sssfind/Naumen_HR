package ru.naumen.experts.auth.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.user.enums.UserRole;

@Data
@Builder
public class AuthResponse {

    private String token;
    private UserRole role;
    private String redirectUrl;
    private Long userId;
    private String fullName;
}
