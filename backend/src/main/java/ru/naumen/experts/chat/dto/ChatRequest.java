package ru.naumen.experts.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ChatRequest {

    @NotBlank
    @Size(max = 2000)
    private String message;

    private List<HistoryMessage> history;

    @Data
    public static class HistoryMessage {
        private String role;

        @Size(max = 2000)
        private String content;
    }
}
