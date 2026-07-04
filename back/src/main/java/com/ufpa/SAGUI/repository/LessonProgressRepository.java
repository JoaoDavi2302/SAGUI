package com.ufpa.SAGUI.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.models.LessonProgress;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {

    long countByStudent_IdAndLesson_Module_IdAndCompletedTrue(UUID studentId, UUID moduleId);
}
