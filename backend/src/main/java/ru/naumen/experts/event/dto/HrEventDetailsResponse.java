package ru.naumen.experts.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class HrEventDetailsResponse {
    private Long id;
    private String title;
    private String description;
    private String eventType;
    private LocalDate eventDate;
    private String organizer;
    private OffsetDateTime createdAt;
    private long invitedCount;
    private List<HrEventParticipantResponse> participants;
}
