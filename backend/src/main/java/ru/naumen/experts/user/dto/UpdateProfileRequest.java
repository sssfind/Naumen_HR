package ru.naumen.experts.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Полное имя обязательно")
    @Size(max = 255, message = "Имя слишком длинное")
    private String fullName;

    @Size(max = 255, message = "Название отдела слишком длинное")
    private String department;

    @Size(max = 50, message = "Телефон слишком длинный")
    private String phone;

    @Size(max = 255, message = "Должность слишком длинная")
    private String position;
}
