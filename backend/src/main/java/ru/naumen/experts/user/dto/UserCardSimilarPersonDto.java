package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserCardSimilarPersonDto {

    private Long id;
    private String fullName;
    private String department;
    private List<String> topSkills;
    private int overlapCount;
}
