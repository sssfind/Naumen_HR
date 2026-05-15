package ru.naumen.experts.search.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CandidateDto {

    private Long userId;
    private String fullName;
    private String department;
    private List<String> matchedTags;
    private double relevanceScore;
}
