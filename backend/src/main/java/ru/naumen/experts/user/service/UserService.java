package ru.naumen.experts.user.service;

import ru.naumen.experts.user.dto.UserProfileCardResponse;
import ru.naumen.experts.user.dto.UserProfileResponse;

public interface UserService {

    UserProfileResponse getProfile(Long userId);

    UserProfileCardResponse getProfileCard(Long userId);
}
