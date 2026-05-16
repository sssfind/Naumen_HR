package ru.naumen.experts.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private int status;
    private String error;
    private String message;
    private String path;
    private OffsetDateTime timestamp;
    private List<FieldError> fieldErrors;

    @Data
    @Builder
    public static class FieldError {
        private String field;
        private String message;
    }
}
