package com.ufpa.SAGUI.dto.course;

import java.util.UUID;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.course.Course;

public record CourseResponse(
    UUID id,
    String name,
    String description,
    EntityStatus status
) {
    public static CourseResponse from(Course course) {
        return new CourseResponse(
            course.getId(),
            course.getName(),
            course.getDescription(),
            course.getStatus()
        );
    }
}
