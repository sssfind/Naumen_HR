package ru.naumen.experts.user.mapper;

import ru.naumen.experts.user.dto.EmployeeResponse;
import ru.naumen.experts.user.dto.TraineeProfileResponse;
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
                .photoUrl(user.getPhotoUrl())
                .team(user.getTeam())
                .totalProgress(calculateTotalProgress(user))
                .moodLevel(user.getMoodLevel())
                .hrId(hr != null ? hr.getId() : null)
                .hrFullName(hr != null ? hr.getFullName() : null)
                .build();
    }

    public static TraineeProfileResponse toTraineeProfileResponse(User trainee) {
        User mentor = trainee.getHr();
        String[] nameParts = splitName(trainee.getFullName());

        return TraineeProfileResponse.builder()
                .userId(trainee.getId())
                .firstName(nameParts[0])
                .lastName(nameParts[1])
                .fullName(trainee.getFullName())
                .photoUrl(trainee.getPhotoUrl())
                .team(trainee.getTeam() != null ? trainee.getTeam() : trainee.getDepartment())
                .email(trainee.getEmail())
                .phone(trainee.getPhone())
                .progressBlockOne(trainee.getProgressBlockOne())
                .progressBlockTwo(trainee.getProgressBlockTwo())
                .progressBlockThree(trainee.getProgressBlockThree())
                .totalProgress(calculateTotalProgress(trainee))
                .mentorFullName(mentor != null ? mentor.getFullName() : null)
                .mentorPhone(mentor != null ? mentor.getPhone() : null)
                .moodLevel(trainee.getMoodLevel())
                .build();
    }

    private static Integer calculateTotalProgress(User user) {
        int first = safeProgress(user.getProgressBlockOne());
        int second = safeProgress(user.getProgressBlockTwo());
        int third = safeProgress(user.getProgressBlockThree());
        return Math.round((first + second + third) / 3.0f);
    }

    private static int safeProgress(Integer value) {
        if (value == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, value));
    }

    private static String[] splitName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[]{"", ""};
        }

        String[] parts = fullName.trim().split("\\s+", 3);
        String lastName = parts.length > 0 ? parts[0] : "";
        String firstName = parts.length > 1 ? parts[1] : "";
        return new String[]{firstName, lastName};
    }
}
