package ru.naumen.experts.skill.service;

import ru.naumen.experts.skill.dto.PeerSkillStarResponse;

public interface PeerSkillStarService {

    PeerSkillStarResponse givePeerStar(Long voterUserId, Long ownerUserId, Long userSkillId);
}
