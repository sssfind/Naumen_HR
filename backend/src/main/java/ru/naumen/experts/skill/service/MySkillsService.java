package ru.naumen.experts.skill.service;

import ru.naumen.experts.skill.dto.UpdateMySkillRequest;
import ru.naumen.experts.skill.dto.UpsertMySkillRequest;
import ru.naumen.experts.user.dto.UserProfileCardResponse;

public interface MySkillsService {

    UserProfileCardResponse upsertMySkill(Long userId, UpsertMySkillRequest request);

    UserProfileCardResponse updateMySkill(Long userId, Long userSkillId, UpdateMySkillRequest request);

    void deleteMySkill(Long userId, Long userSkillId);
}
