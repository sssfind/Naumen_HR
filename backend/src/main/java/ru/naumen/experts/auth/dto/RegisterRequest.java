package ru.naumen.experts.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import ru.naumen.experts.user.enums.UserRole;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный формат email")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 8, message = "Пароль должен содержать минимум 8 символов")
    private String password;

    @NotBlank(message = "Полное имя обязательно")
    @Size(max = 255, message = "Имя слишком длинное")
    private String fullName;

    @Size(max = 255, message = "Название отдела слишком длинное")
    private String department;

    private UserRole role;
}
