package ru.naumen.experts.auth.service;

import ru.naumen.experts.auth.dto.AuthResponse;
import ru.naumen.experts.auth.dto.LoginRequest;
import ru.naumen.experts.auth.dto.RegisterRequest;
import ru.naumen.experts.auth.dto.UserInfoResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserInfoResponse getCurrentUser(Long userId);
}
