package ru.naumen.experts.event.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteUserToEventRequest {

    @NotNull(message = "userId обязателен")
    private Long userId;
}
