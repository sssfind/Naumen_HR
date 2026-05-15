package ru.naumen.experts.invitation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvitationRequest {

    @NotNull(message = "expertId обязателен")
    private Long expertId;

    @NotBlank(message = "Название мероприятия не должно быть пустым")
    private String eventName;
}
