package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TraineeDashboardResponse {

    private List<TaskProgressBlock> taskBlocks;
    private Integer totalProgress;

    @Data
    @Builder
    public static class TaskProgressBlock {
        private String id;
        private String title;
        private Integer progress;
    }
}
