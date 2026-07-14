package com.ufpa.SAGUI.dto.lesson;

import java.util.UUID;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.lesson.Lesson;

public record LessonResponse(
    UUID id,
    String name,
    String description,
    Integer orderIndex,
    EntityStatus status,
    UUID moduleId
) {
    public static LessonResponse from(Lesson lesson) {
        return new LessonResponse(
            lesson.getId(),
            lesson.getName(),
            lesson.getDescription(),
            lesson.getOrderIndex(),
            lesson.getStatus(),
            lesson.getModule() != null ? lesson.getModule().getId() : null
        );
    }
}
