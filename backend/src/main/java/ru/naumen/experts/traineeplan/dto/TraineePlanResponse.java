package ru.naumen.experts.traineeplan.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TraineePlanResponse {

    private List<TraineePlanBlockResponse> blocks;

    @Data
    @Builder
    public static class TraineePlanBlockResponse {
        private String id;
        private String title;
        private List<TraineePlanTaskResponse> tasks;
    }
}
