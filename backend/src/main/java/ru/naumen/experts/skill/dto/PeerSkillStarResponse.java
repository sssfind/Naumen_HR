package ru.naumen.experts.skill.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PeerSkillStarResponse {
    Long userSkillId;
    int stars;
}
