package ru.naumen.experts.event.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.naumen.experts.event.entity.CorporateEvent;

import java.util.List;
import java.util.Optional;

public interface CorporateEventRepository extends JpaRepository<CorporateEvent, Long> {

    List<CorporateEvent> findByEventType(String eventType, Sort sort);

    Optional<CorporateEvent> findByIdAndEventType(Long id, String eventType);
}
