package ru.naumen.experts.event.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.naumen.experts.event.entity.EventInvitation;

import java.util.List;

public interface EventInvitationRepository extends JpaRepository<EventInvitation, Long> {

    boolean existsByEvent_IdAndInvitedUser_Id(Long eventId, Long invitedUserId);

    @Query("""
            SELECT ei.event.id, COUNT(ei.id)
            FROM EventInvitation ei
            WHERE ei.event.id IN :eventIds
            GROUP BY ei.event.id
            """)
    List<Object[]> countByEventIds(@Param("eventIds") List<Long> eventIds);

    @EntityGraph(attributePaths = {"invitedUser"})
    @Query("""
            SELECT ei
            FROM EventInvitation ei
            WHERE ei.event.id = :eventId
            ORDER BY ei.invitedAt DESC, ei.id DESC
            """)
    List<EventInvitation> findByEventIdWithInvitedUser(@Param("eventId") Long eventId);

    void deleteByEvent_Id(Long eventId);
}
