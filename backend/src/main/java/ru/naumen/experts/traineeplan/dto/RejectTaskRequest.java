package ru.naumen.experts.traineeplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectTaskRequest {

    @NotBlank(message = "Укажите комментарий при отклонении задачи")
    @Size(max = 2000, message = "Комментарий не длиннее 2000 символов")
    private String comment;
}
