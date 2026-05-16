package ru.naumen.experts.chat.dto;

import java.util.List;

public record OpenRouterChatRequest(
        String model,
        List<Message> messages,
        Double temperature,
        Integer max_tokens
) {
    public record Message(String role, String content) {
    }
}
