package ru.naumen.experts.skill.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.exception.PeerSkillStarAlreadyGivenException;
import ru.naumen.experts.skill.dto.PeerSkillStarResponse;
import ru.naumen.experts.skill.entity.PeerSkillStarVote;
import ru.naumen.experts.skill.entity.UserSkill;
import ru.naumen.experts.skill.repository.PeerSkillStarVoteRepository;
import ru.naumen.experts.skill.repository.UserSkillRepository;
import ru.naumen.experts.user.repository.UserRepository;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class PeerSkillStarServiceImpl implements PeerSkillStarService {

    /** Совпадает с верхней границей сидов и отображения звёзд на карточке эксперта */
    private static final int MAX_STARS = 15;

    private final UserSkillRepository userSkillRepository;
    private final PeerSkillStarVoteRepository peerSkillStarVoteRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PeerSkillStarResponse givePeerStar(Long voterUserId, Long ownerUserId, Long userSkillId) {
        if (voterUserId.equals(ownerUserId)) {
            throw new IllegalArgumentException("Нельзя поставить звезду себе");
        }

        UserSkill userSkill = userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new IllegalArgumentException("Запись навыка не найдена"));

        if (!userSkill.getUser().getId().equals(ownerUserId)) {
            throw new IllegalArgumentException("Некорректный пользователь для этой записи навыка");
        }

        if (peerSkillStarVoteRepository.existsByVoter_IdAndUserSkill_Id(voterUserId, userSkillId)) {
            throw new PeerSkillStarAlreadyGivenException();
        }

        int current = userSkill.getStars() != null ? userSkill.getStars() : 0;
        if (current >= MAX_STARS) {
            throw new IllegalArgumentException("У этого навыка уже максимум звёзд");
        }

        PeerSkillStarVote vote = PeerSkillStarVote.builder()
                .voter(userRepository.getReferenceById(voterUserId))
                .userSkill(userSkill)
                .createdAt(OffsetDateTime.now())
                .build();
        peerSkillStarVoteRepository.save(vote);

        userSkill.setStars(current + 1);
        userSkill.setUpdatedAt(OffsetDateTime.now());
        userSkillRepository.save(userSkill);

        return PeerSkillStarResponse.builder()
                .userSkillId(userSkillId)
                .stars(userSkill.getStars())
                .build();
    }
}
