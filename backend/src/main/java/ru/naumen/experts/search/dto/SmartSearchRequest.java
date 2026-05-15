package ru.naumen.experts.search.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class SmartSearchRequest {

    @NotBlank
    private String query;

    private List<String> tags;
}
