package ru.naumen.experts.user.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.event.enums.ParticipationRole;
import ru.naumen.experts.event.enums.ResultLevel;

import java.time.LocalDate;

@Data
@Builder
public class UserCardEventDto {

    private String title;
    private String eventType;
    private LocalDate eventDate;
    private ParticipationRole participationRole;
    private ResultLevel resultLevel;
    private String feedback;
}
