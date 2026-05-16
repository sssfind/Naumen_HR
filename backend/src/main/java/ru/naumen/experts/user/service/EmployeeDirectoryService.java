package ru.naumen.experts.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.user.dto.EmployeeResponse;
import ru.naumen.experts.user.dto.PagedEmployeesResponse;
import ru.naumen.experts.user.entity.User;
import ru.naumen.experts.user.mapper.UserMapper;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeDirectoryService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedEmployeesResponse search(String search, String department, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> result = userRepository.searchActiveUsers(
                normalize(search),
                normalize(department),
                pageable
        );

        List<EmployeeResponse> content = result.getContent().stream()
                .map(UserMapper::toEmployeeResponse)
                .toList();

        return PagedEmployeesResponse.builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}
