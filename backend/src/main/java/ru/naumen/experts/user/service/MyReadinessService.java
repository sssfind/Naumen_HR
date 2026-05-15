package ru.naumen.experts.user.service;

import ru.naumen.experts.user.dto.AddMyReadinessRequest;
import ru.naumen.experts.user.dto.UserProfileCardResponse;
import ru.naumen.experts.user.enums.ReadinessEventType;

public interface MyReadinessService {

    UserProfileCardResponse addMyReadiness(Long userId, AddMyReadinessRequest request);

    void deleteMyReadiness(Long userId, ReadinessEventType readinessEventType);
}
