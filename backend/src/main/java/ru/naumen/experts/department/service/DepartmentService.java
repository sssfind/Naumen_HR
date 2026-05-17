package ru.naumen.experts.department.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.naumen.experts.department.dto.DepartmentDto;
import ru.naumen.experts.department.dto.DepartmentTreeNodeDto;
import ru.naumen.experts.department.entity.Department;
import ru.naumen.experts.department.repository.DepartmentRepository;
import ru.naumen.experts.user.repository.UserRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DepartmentTreeNodeDto> getTree() {
        List<Department> departments = departmentRepository.findAllWithParentOrderBySortOrderAscNameAsc();
        Map<Long, Long> employeeCounts = userRepository.countActiveUsersByDepartmentId().stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        Map<Long, DepartmentTreeNodeDto> nodes = new HashMap<>();
        for (Department department : departments) {
            nodes.put(department.getId(), DepartmentTreeNodeDto.builder()
                    .id(department.getId())
                    .name(department.getName())
                    .description(department.getDescription())
                    .employeeCount(employeeCounts.getOrDefault(department.getId(), 0L).intValue())
                    .children(new ArrayList<>())
                    .build());
        }

        List<DepartmentTreeNodeDto> roots = new ArrayList<>();
        for (Department department : departments) {
            DepartmentTreeNodeDto node = nodes.get(department.getId());
            if (department.getParent() == null) {
                roots.add(node);
            } else {
                DepartmentTreeNodeDto parent = nodes.get(department.getParent().getId());
                if (parent != null) {
                    parent.getChildren().add(node);
                }
            }
        }

        roots.sort(Comparator.comparing(DepartmentTreeNodeDto::getName));
        for (DepartmentTreeNodeDto root : roots) {
            sortChildren(root);
            aggregateEmployeeCount(root);
        }
        return roots;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> listFlat() {
        return departmentRepository.findAllByOrderBySortOrderAscNameAsc().stream()
                .filter(d -> d.getParent() != null)
                .map(d -> DepartmentDto.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .parentId(d.getParent().getId())
                        .parentName(d.getParent().getName())
                        .description(d.getDescription())
                        .build())
                .toList();
    }

    private void sortChildren(DepartmentTreeNodeDto node) {
        node.getChildren().sort(Comparator.comparing(DepartmentTreeNodeDto::getName));
        node.getChildren().forEach(this::sortChildren);
    }

    private int aggregateEmployeeCount(DepartmentTreeNodeDto node) {
        int total = node.getEmployeeCount();
        for (DepartmentTreeNodeDto child : node.getChildren()) {
            total += aggregateEmployeeCount(child);
        }
        node.setEmployeeCount(total);
        return total;
    }

    @Transactional(readOnly = true)
    public List<Long> resolveFilterDepartmentIds(Long departmentId) {
        if (departmentId == null) {
            return null;
        }
        List<Department> all = departmentRepository.findAllWithParentOrderBySortOrderAscNameAsc();
        Map<Long, List<Long>> childrenByParent = new HashMap<>();
        for (Department department : all) {
            if (department.getParent() != null) {
                childrenByParent
                        .computeIfAbsent(department.getParent().getId(), ignored -> new ArrayList<>())
                        .add(department.getId());
            }
        }

        List<Long> result = new ArrayList<>();
        collectDescendantIds(departmentId, childrenByParent, result);
        boolean isKnown = all.stream().anyMatch(d -> d.getId().equals(departmentId));
        if (!isKnown) {
            return List.of(departmentId);
        }
        return result.isEmpty() ? List.of(departmentId) : result;
    }

    private void collectDescendantIds(Long id, Map<Long, List<Long>> childrenByParent, List<Long> result) {
        result.add(id);
        for (Long childId : childrenByParent.getOrDefault(id, List.of())) {
            collectDescendantIds(childId, childrenByParent, result);
        }
    }
}
