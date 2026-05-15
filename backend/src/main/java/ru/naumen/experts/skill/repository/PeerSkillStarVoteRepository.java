package ru.naumen.experts.skill.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.naumen.experts.skill.entity.PeerSkillStarVote;

import java.util.Collection;
import java.util.List;

public interface PeerSkillStarVoteRepository extends JpaRepository<PeerSkillStarVote, Long> {

    boolean existsByVoter_IdAndUserSkill_Id(Long voterId, Long userSkillId);

    @Query("SELECT v.userSkill.id FROM PeerSkillStarVote v WHERE v.voter.id = :voterId AND v.userSkill.id IN :ids")
    List<Long> findVotedUserSkillIds(@Param("voterId") Long voterId, @Param("ids") Collection<Long> ids);
}
