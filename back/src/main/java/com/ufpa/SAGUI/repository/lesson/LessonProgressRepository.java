package com.ufpa.SAGUI.repository.lesson;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.models.lesson.LessonProgress;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {

    long countByStudent_IdAndLesson_Module_IdAndCompletedTrue(UUID studentId, UUID moduleId);

    Optional<LessonProgress> findByStudent_IdAndLesson_Id(UUID studentId, UUID lessonId);
}
