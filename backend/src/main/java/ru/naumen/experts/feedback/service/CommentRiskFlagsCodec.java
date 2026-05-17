package ru.naumen.experts.feedback.service;

import ru.naumen.experts.feedback.enums.CommentRiskFlag;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public final class CommentRiskFlagsCodec {

    private CommentRiskFlagsCodec() {
    }

    public static String encode(List<CommentRiskFlag> flags) {
        if (flags == null || flags.isEmpty()) {
            return "";
        }
        return flags.stream().map(Enum::name).collect(Collectors.joining(","));
    }

    public static List<CommentRiskFlag> decode(String encoded) {
        if (encoded == null || encoded.isBlank()) {
            return List.of();
        }
        return Arrays.stream(encoded.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(CommentRiskFlag::valueOf)
                .toList();
    }
}
