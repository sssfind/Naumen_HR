package ru.naumen.experts.feedback.service;

import ru.naumen.experts.exception.BadRequestException;
import ru.naumen.experts.feedback.enums.ResourceIssue;

import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

public final class FeedbackResourceIssuesCodec {

    private FeedbackResourceIssuesCodec() {
    }

    public static String encode(List<ResourceIssue> issues) {
        validateSelection(issues);
        return issues.stream()
                .map(Enum::name)
                .sorted()
                .collect(Collectors.joining(","));
    }

    public static List<ResourceIssue> decode(String encoded) {
        if (encoded == null || encoded.isBlank()) {
            return List.of();
        }
        return Arrays.stream(encoded.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(ResourceIssue::valueOf)
                .toList();
    }

    public static void validateSelection(List<ResourceIssue> issues) {
        if (issues == null || issues.isEmpty()) {
            throw new BadRequestException("Выберите хотя бы один вариант по доступам и ресурсам");
        }
        EnumSet<ResourceIssue> set = EnumSet.copyOf(issues);
        if (set.contains(ResourceIssue.ALL_OK) && set.size() > 1) {
            throw new BadRequestException(
                    "Вариант «Всё в наличии» нельзя сочетать с проблемами доступа");
        }
    }
}
