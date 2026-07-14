package com.ufpa.SAGUI.dto.module;

import java.util.UUID;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.module.Module;

public record ModuleResponse(
    UUID id,
    String name,
    String description,
    Integer orderIndex,
    EntityStatus status,
    UUID disciplineId
) {
    public static ModuleResponse from(Module module) {
        return new ModuleResponse(
            module.getId(),
            module.getName(),
            module.getDescription(),
            module.getOrderIndex(),
            module.getStatus(),
            module.getDiscipline() != null ? module.getDiscipline().getId() : null
        );
    }
}
