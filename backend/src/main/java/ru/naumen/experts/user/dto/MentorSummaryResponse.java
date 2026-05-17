package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.user.enums.UserRole;

@Data
@Builder
public class MentorSummaryResponse {

    private Long userId;
    private String email;
    private String fullName;
    private UserRole role;
    private String department;
    private String parentDepartmentName;
    private String divisionName;
    private String responsibilityZone;
    private String phone;
    private String position;
    private String photoUrl;
    private String team;
}
