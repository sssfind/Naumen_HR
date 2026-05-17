package ru.naumen.experts.user.mapper;

import ru.naumen.experts.department.entity.Department;
import ru.naumen.experts.user.dto.EmployeeResponse;
import ru.naumen.experts.user.dto.TraineeEmployeeResponse;
import ru.naumen.experts.user.dto.TraineeProfileResponse;
import ru.naumen.experts.user.dto.UserProfileResponse;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .position(user.getPosition());

        if (user.getRole() == UserRole.ROLE_TRAINEE) {
            builder.team(user.getTeam() != null ? user.getTeam() : user.getDepartment())
                    .photoUrl(user.getPhotoUrl())
                    .moodLevel(user.getMoodLevel())
                    .progressBlockOne(safeProgress(user.getProgressBlockOne()))
                    .progressBlockTwo(safeProgress(user.getProgressBlockTwo()))
                    .progressBlockThree(safeProgress(user.getProgressBlockThree()))
                    .totalProgress(calculateTotalProgress(user))
                    .mentorFullName(user.getMentor() != null ? user.getMentor().getFullName() : null);
        }

        return builder.build();
    }

    public static TraineeEmployeeResponse toTraineeEmployeeResponse(User user, String traineeTeam) {
        DepartmentContext dept = departmentContext(user);
        return TraineeEmployeeResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .departmentId(dept.departmentId())
                .department(dept.departmentName())
                .parentDepartmentName(dept.parentDepartmentName())
                .divisionName(dept.divisionName())
                .responsibilityZone(user.getResponsibilityZone())
                .phone(user.getPhone())
                .position(user.getPosition())
                .photoUrl(user.getPhotoUrl())
                .team(user.getTeam())
                .inMyTeam(isSameTeam(traineeTeam, user.getTeam()))
                .build();
    }

    public static Integer calculateTotalProgress(User user) {
        int first = safeProgress(user.getProgressBlockOne());
        int second = safeProgress(user.getProgressBlockTwo());
        int third = safeProgress(user.getProgressBlockThree());
        return Math.round((first + second + third) / 3.0f);
    }

    private static boolean isSameTeam(String traineeTeam, String otherTeam) {
        return traineeTeam != null && otherTeam != null && traineeTeam.equals(otherTeam);
    }

    public static EmployeeResponse toEmployeeResponse(User user) {
        User hr = user.getHr();
        User mentor = user.getMentor();
        DepartmentContext dept = departmentContext(user);
        return EmployeeResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .departmentId(dept.departmentId())
                .department(dept.departmentName())
                .parentDepartmentName(dept.parentDepartmentName())
                .divisionName(dept.divisionName())
                .responsibilityZone(user.getResponsibilityZone())
                .phone(user.getPhone())
                .position(user.getPosition())
                .photoUrl(user.getPhotoUrl())
                .team(user.getTeam())
                .totalProgress(calculateTotalProgress(user))
                .moodLevel(user.getMoodLevel())
                .hrId(hr != null ? hr.getId() : null)
                .hrFullName(hr != null ? hr.getFullName() : null)
                .mentorId(mentor != null ? mentor.getId() : null)
                .mentorFullName(mentor != null ? mentor.getFullName() : null)
                .build();
    }

    public static TraineeProfileResponse toTraineeProfileResponse(User trainee) {
        User mentor = trainee.getMentor();
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
                .mentorId(mentor != null ? mentor.getId() : null)
                .mentorFullName(mentor != null ? mentor.getFullName() : null)
                .mentorPhone(mentor != null ? mentor.getPhone() : null)
                .moodLevel(trainee.getMoodLevel())
                .build();
    }

    private static int safeProgress(Integer value) {
        if (value == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, value));
    }

    private static DepartmentContext departmentContext(User user) {
        Department org = user.getOrgDepartment();
        if (org == null) {
            return new DepartmentContext(null, user.getDepartment(), null, null);
        }
        Department parent = org.getParent();
        String divisionName = parent == null ? org.getName() : parent.getName();
        String parentName = parent == null ? null : parent.getName();
        return new DepartmentContext(org.getId(), org.getName(), parentName, divisionName);
    }

    private record DepartmentContext(
            Long departmentId,
            String departmentName,
            String parentDepartmentName,
            String divisionName) {
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
