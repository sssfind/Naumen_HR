package ru.naumen.experts.skill.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.skill.dto.UpdateMySkillRequest;
import ru.naumen.experts.skill.dto.UpsertMySkillRequest;
import ru.naumen.experts.skill.entity.Skill;
import ru.naumen.experts.skill.entity.UserSkill;
import ru.naumen.experts.skill.repository.SkillRepository;
import ru.naumen.experts.skill.repository.UserSkillRepository;
import ru.naumen.experts.user.dto.UserProfileCardResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.repository.UserRepository;
import ru.naumen.experts.user.service.UserService;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class MySkillsServiceImpl implements MySkillsService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserService userService;

    @Override
    @Transactional
    public UserProfileCardResponse upsertMySkill(Long userId, UpsertMySkillRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new IllegalArgumentException("Навык не найден"));

        if (Boolean.FALSE.equals(skill.getIsActive())) {
            throw new IllegalArgumentException("Навык недоступен для добавления");
        }

        UserSkill userSkill = userSkillRepository.findByUser_IdAndSkill_Id(userId, skill.getId())
                .orElseGet(() -> UserSkill.builder()
                        .user(user)
                        .skill(skill)
                        .stars(0)
                        .proficiencyLevel(request.getProficiencyLevel())
                        .notes(null)
                        .updatedAt(OffsetDateTime.now())
                        .build());

        userSkill.setProficiencyLevel(request.getProficiencyLevel());
        userSkill.setUpdatedAt(OffsetDateTime.now());

        userSkillRepository.save(userSkill);
        return userService.getProfileCard(userId);
    }

    @Override
    @Transactional
    public UserProfileCardResponse updateMySkill(Long userId, Long userSkillId, UpdateMySkillRequest request) {
        UserSkill userSkill = userSkillRepository.findByIdAndUser_Id(userSkillId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Запись навыка не найдена"));

        userSkill.setProficiencyLevel(request.getProficiencyLevel());
        userSkill.setUpdatedAt(OffsetDateTime.now());

        userSkillRepository.save(userSkill);
        return userService.getProfileCard(userId);
    }

    @Override
    @Transactional
    public void deleteMySkill(Long userId, Long userSkillId) {
        UserSkill userSkill = userSkillRepository.findByIdAndUser_Id(userSkillId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Запись навыка не найдена"));
        userSkillRepository.delete(userSkill);
    }
}
