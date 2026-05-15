package ru.naumen.experts.expert.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SkillDto {
    private Long userSkillId;
    private String name;
    private String category;
    private int stars;
    /** Текущий пользователь уже поставил звезду за эту запись user_skill */
    private boolean viewerPeerStarGiven;
}
