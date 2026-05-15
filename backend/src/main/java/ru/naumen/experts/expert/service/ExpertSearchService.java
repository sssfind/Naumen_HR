package ru.naumen.experts.expert.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ru.naumen.experts.expert.dto.ExpertResponseDTO;
import ru.naumen.experts.expert.dto.ExpertSearchCriteriaDTO;

public interface ExpertSearchService {
    Page<ExpertResponseDTO> searchExperts(ExpertSearchCriteriaDTO criteria, Pageable pageable, Long viewerUserId);
}
