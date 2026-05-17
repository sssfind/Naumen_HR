package ru.naumen.experts.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.naumen.experts.exception.ForbiddenException;
import ru.naumen.experts.exception.UserNotFoundException;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.enums.UserRole;
import ru.naumen.experts.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class StaffAccessService {

    private final UserRepository userRepository;

    public User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }

    public boolean isHr(User user) {
        return user.getRole() == UserRole.ROLE_HR;
    }

    public boolean isMentor(User user) {
        return user.getRole() == UserRole.ROLE_MENTOR;
    }

    public boolean isHrOrMentor(User user) {
        return isHr(user) || isMentor(user);
    }

    public void requireHr(User user) {
        if (!isHr(user)) {
            throw new ForbiddenException("Доступно только для HR");
        }
    }

    public void requireHrOrMentor(User user) {
        if (!isHrOrMentor(user)) {
            throw new ForbiddenException("Доступно только для HR и наставников");
        }
    }

    public void requireCanViewTrainee(User staff, User trainee) {
        requireHrOrMentor(staff);
        if (trainee.getRole() != UserRole.ROLE_TRAINEE) {
            throw new ForbiddenException("Пользователь не является стажёром");
        }
        if (isHr(staff)) {
            return;
        }
        if (isMentor(staff)) {
            User mentor = trainee.getMentor();
            if (mentor == null || !mentor.getId().equals(staff.getId())) {
                throw new ForbiddenException("Стажёр не закреплён за вами");
            }
        }
    }

    public boolean canViewTrainee(User staff, User trainee) {
        if (trainee.getRole() != UserRole.ROLE_TRAINEE) {
            return false;
        }
        if (isHr(staff)) {
            return true;
        }
        if (isMentor(staff)) {
            User mentor = trainee.getMentor();
            return mentor != null && mentor.getId().equals(staff.getId());
        }
        return false;
    }
}
