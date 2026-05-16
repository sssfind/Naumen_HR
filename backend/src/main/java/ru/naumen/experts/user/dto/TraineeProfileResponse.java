package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TraineeProfileResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String photoUrl;
    private String team;
    private String email;
    private String phone;
    private Integer progressBlockOne;
    private Integer progressBlockTwo;
    private Integer progressBlockThree;
    private Integer totalProgress;
    private String mentorFullName;
    private String mentorPhone;
    private Integer moodLevel;
}
