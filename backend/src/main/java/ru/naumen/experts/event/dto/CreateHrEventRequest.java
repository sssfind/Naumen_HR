package ru.naumen.experts.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateHrEventRequest {

    @NotBlank(message = "Название мероприятия не должно быть пустым")
    @Size(max = 255, message = "Название мероприятия не должно превышать 255 символов")
    private String title;

    @NotBlank(message = "Описание мероприятия не должно быть пустым")
    @Size(max = 5000, message = "Описание мероприятия не должно превышать 5000 символов")
    private String description;
}
