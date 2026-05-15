package ru.naumen.experts.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.naumen.experts.user.entity.UserReadiness;
import ru.naumen.experts.user.enums.ReadinessEventType;

import java.util.List;

public interface UserReadinessRepository extends JpaRepository<UserReadiness, Long> {

    List<UserReadiness> findByUser_Id(Long userId);

    boolean existsByUser_IdAndReadinessEventType(Long userId, ReadinessEventType type);

    void deleteByUser_IdAndReadinessEventType(Long userId, ReadinessEventType type);
}
