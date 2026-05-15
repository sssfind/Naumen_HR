package ru.naumen.experts.search.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.naumen.experts.search.dto.CandidateDto;
import ru.naumen.experts.search.dto.SmartSearchResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartSearchServiceImpl implements SmartSearchService {

    private static final Long MOCK_CANDIDATE_ID = 1L;
    private static final String MOCK_CANDIDATE_NAME = "Алексей Петров";
    private static final String MOCK_CANDIDATE_DEPARTMENT = "Разработка";
    private static final String REASONING_MESSAGE = "Кандидат соответствует критериям поиска. AI-интеграция будет добавлена позже.";
    private static final double DEFAULT_RELEVANCE_SCORE = 0.95;

    @Override
    public SmartSearchResponse search(String query, List<String> tags, Long requestedByUserId) {
        log.info("Smart search query='{}', tags={}, userId={}", query, tags, requestedByUserId);

        return SmartSearchResponse.builder()
                .answer("Найдены подходящие кандидаты по запросу: " + query)
                .candidates(List.of(buildMockCandidate(tags)))
                .reasoning(REASONING_MESSAGE)
                .mockResponse(true)
                .build();
    }

    private CandidateDto buildMockCandidate(List<String> tags) {
        return CandidateDto.builder()
                .userId(MOCK_CANDIDATE_ID)
                .fullName(MOCK_CANDIDATE_NAME)
                .department(MOCK_CANDIDATE_DEPARTMENT)
                .matchedTags(tags != null ? tags : List.of())
                .relevanceScore(DEFAULT_RELEVANCE_SCORE)
                .build();
    }
}
