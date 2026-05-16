package ru.naumen.experts.reminder.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReminderSyncResponse {

    private int created;
}
