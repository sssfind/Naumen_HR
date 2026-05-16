package ru.naumen.experts.traineeplan.dto;

import lombok.Builder;
import lombok.Data;
import ru.naumen.experts.user.enums.UserRole;

import java.time.OffsetDateTime;

@Data
@Builder
public class TraineePlanTaskCommentResponse {

    private Long id;
    private String authorFullName;
    private UserRole authorRole;
    private String text;
    private OffsetDateTime createdAt;
}
