package com.ufpa.SAGUI.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Course;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    Page<Course> findAllByStatus(EntityStatus status, Pageable pageable);
    Optional<Course> findByIdAndStatus(UUID id, EntityStatus status);
}
