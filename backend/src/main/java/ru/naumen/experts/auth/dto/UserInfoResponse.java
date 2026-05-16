package ru.naumen.experts.auth.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.user.enums.UserRole;

@Data
@Builder
public class UserInfoResponse {

    private Long userId;
    private String email;
    private String fullName;
    private UserRole role;
    private String department;
    private String phone;
    private String position;
}
