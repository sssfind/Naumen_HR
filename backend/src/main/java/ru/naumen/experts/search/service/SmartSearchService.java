package ru.naumen.experts.search.service;

import ru.naumen.experts.search.dto.SmartSearchResponse;

import java.util.List;

public interface SmartSearchService {

    SmartSearchResponse search(String query, List<String> tags, Long requestedByUserId);
}
