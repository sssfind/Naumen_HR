package ru.naumen.experts.traineeplan.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectTaskRequest {

    @Size(max = 2000, message = "Комментарий не длиннее 2000 символов")
    private String comment;
}
