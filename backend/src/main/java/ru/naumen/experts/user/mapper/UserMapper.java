package ru.naumen.experts.user.mapper;

import ru.naumen.experts.user.dto.EmployeeResponse;
import ru.naumen.experts.user.dto.UserProfileResponse;
import ru.naumen.experts.user.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .position(user.getPosition())
                .build();
    }

    public static EmployeeResponse toEmployeeResponse(User user) {
        User hr = user.getHr();
        return EmployeeResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .position(user.getPosition())
                .hrId(hr != null ? hr.getId() : null)
                .hrFullName(hr != null ? hr.getFullName() : null)
                .build();
    }
}
