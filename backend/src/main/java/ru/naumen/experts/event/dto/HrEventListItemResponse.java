package ru.naumen.experts.event.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class HrEventListItemResponse {
    private Long id;
    private String title;
    private String description;
    private String eventType;
    private LocalDate eventDate;
    private String organizer;
    private OffsetDateTime createdAt;
    private long invitedCount;
}
