package ru.naumen.experts.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.auth.dto.AuthResponse;
import ru.naumen.experts.auth.dto.LoginRequest;
import ru.naumen.experts.auth.dto.RegisterRequest;
import ru.naumen.experts.auth.dto.UserInfoResponse;
import ru.naumen.experts.auth.jwt.JwtTokenProvider;
import ru.naumen.experts.config.AppSecurityProperties;
import ru.naumen.experts.exception.CorporateEmailRequiredException;
import ru.naumen.experts.exception.UserAlreadyExistsException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.repository.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AppSecurityProperties securityProperties;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validateCorporateEmail(request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(request.getEmail());
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.ROLE_TRAINEE;

        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .department(request.getDepartment())
                .role(role)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Зарегистрирован новый пользователь: {}, роль: {}", savedUser.getEmail(), savedUser.getRole());

        String token = jwtTokenProvider.generateToken(savedUser);
        return buildAuthResponse(savedUser, token);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        validateCorporateEmail(request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new UserNotFoundException(request.getEmail()));

        String token = jwtTokenProvider.generateToken(user);
        log.info("Пользователь вошёл в систему: {}", user.getEmail());

        return buildAuthResponse(user, token);
    }

    @Override
    @Transactional(readOnly = true)
    public UserInfoResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        return UserInfoResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .position(user.getPosition())
                .build();
    }

    private void validateCorporateEmail(String email) {
        String domain = "@" + securityProperties.getAllowedEmailDomain().toLowerCase();
        if (email == null || !email.toLowerCase().endsWith(domain)) {
            throw new CorporateEmailRequiredException(email);
        }
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        String redirectUrl = switch (user.getRole()) {
            case ROLE_HR -> "/dashboard/hr";
            case ROLE_MENTOR -> "/dashboard/mentor";
            case ROLE_TRAINEE -> "/dashboard/trainee";
            default -> "/app";
        };

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .redirectUrl(redirectUrl)
                .userId(user.getId())
                .fullName(user.getFullName())
                .build();
    }
}
