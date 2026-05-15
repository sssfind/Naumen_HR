package ru.naumen.experts.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import ru.naumen.experts.user.enums.ReadinessEventType;

@Data
public class AddMyReadinessRequest {

    @NotNull
    private ReadinessEventType readinessEventType;
}
