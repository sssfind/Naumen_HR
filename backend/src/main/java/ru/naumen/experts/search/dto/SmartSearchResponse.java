package ru.naumen.experts.search.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SmartSearchResponse {

    private String answer;
    private List<CandidateDto> candidates;
    private String reasoning;
    private boolean mockResponse;
}
