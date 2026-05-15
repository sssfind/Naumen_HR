package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.user.enums.ReadinessEventType;
import ru.naumen.experts.user.enums.UserRole;

import java.util.List;

@Data
@Builder
public class UserProfileResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String department;
    private UserRole role;
    private String initials;
    private List<ReadinessEventType> readiness;
}
