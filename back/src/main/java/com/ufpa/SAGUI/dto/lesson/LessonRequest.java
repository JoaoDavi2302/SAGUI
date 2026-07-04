package com.ufpa.SAGUI.dto.lesson;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LessonRequest(
        @NotBlank(message = "O nome da aula é obrigatório")
        @Size(max = 200)
        String name,

        String description,

        @NotNull(message = "A ordem da aula é obrigatória")
        Integer orderIndex,

        @NotNull(message = "O ID do módulo é obrigatório")
        UUID moduleId) {
}
