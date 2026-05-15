package ru.naumen.experts.event.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.naumen.experts.event.entity.UserEventExperience;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserEventExperienceRepository extends JpaRepository<UserEventExperience, Long> {

    @Query("""
            SELECT uee FROM UserEventExperience uee
            JOIN FETCH uee.event ev
            WHERE uee.user.id = :userId
            ORDER BY ev.eventDate DESC, uee.id DESC
            """)
    List<UserEventExperience> findByUserIdWithEvents(@Param("userId") Long userId);

    @Query("""
            SELECT uee FROM UserEventExperience uee
            JOIN FETCH uee.event ev
            WHERE uee.user.id IN :userIds
            """)
    List<UserEventExperience> findByUserIdsWithEvents(@Param("userIds") List<Long> userIds);

    @Query("""
            SELECT uee.user.id, COUNT(uee.id)
            FROM UserEventExperience uee
            WHERE uee.user.id IN :userIds
            GROUP BY uee.user.id
            """)
    List<Object[]> countEventsByUserIdIn(@Param("userIds") Collection<Long> userIds);

    Optional<UserEventExperience> findFirstByEvent_IdAndUser_IdOrderByIdAsc(Long eventId, Long userId);

    List<UserEventExperience> findByEvent_IdAndUser_IdIn(Long eventId, Collection<Long> userIds);
}
