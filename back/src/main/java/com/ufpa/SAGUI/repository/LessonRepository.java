package com.ufpa.SAGUI.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    Page<Lesson> findAllByModule_Id(UUID moduleId, Pageable pageable);
    Page<Lesson> findAllByModule_IdAndStatus(UUID moduleId, EntityStatus status, Pageable pageable);
    long countByModule_Id(UUID moduleId);
    long countByModule_IdAndStatus(UUID moduleId, EntityStatus status);
}
