package ru.naumen.experts.department.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.naumen.experts.department.entity.Department;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.parent ORDER BY d.sortOrder ASC, d.name ASC")
    List<Department> findAllWithParentOrderBySortOrderAscNameAsc();

    List<Department> findAllByOrderBySortOrderAscNameAsc();

    Optional<Department> findByNameAndParentIsNull(String name);

    Optional<Department> findByNameAndParentId(String name, Long parentId);
}
