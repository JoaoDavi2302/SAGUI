package com.ufpa.SAGUI.dto.discipline;

import java.util.UUID;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.discipline.Discipline;

public record DisciplineResponse(
    UUID id,
    String name,
    String description,
    EntityStatus status,
    UUID courseId,
    UUID responsibleProfessorId
) {
    public static DisciplineResponse from(Discipline discipline) {
        return new DisciplineResponse(
            discipline.getId(),
            discipline.getName(),
            discipline.getDescription(),
            discipline.getStatus(),
            discipline.getCourse() != null ? discipline.getCourse().getId() : null,
            discipline.getResponsibleProfessor() != null ? discipline.getResponsibleProfessor().getId() : null
        );
    }
}
