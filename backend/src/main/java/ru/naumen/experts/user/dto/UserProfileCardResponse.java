package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.user.enums.ReadinessEventType;
import ru.naumen.experts.user.enums.UserRole;

import java.util.List;

@Data
@Builder
public class UserProfileCardResponse {

    private Long id;
    private String fullName;
    private String email;
    private String department;
    private UserRole role;
    private String initials;
    private List<ReadinessEventType> readiness;
    private List<UserCardSkillDto> professionalSkills;
    private List<UserCardSkillDto> expertSkills;
    private List<UserCardEventDto> events;
    private List<UserCardSimilarPersonDto> similarPeople;
}
