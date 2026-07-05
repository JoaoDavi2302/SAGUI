package com.ufpa.SAGUI.dto.discipline;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DisciplineRequest(
    @NotBlank(message = "O nome da disciplina é obrigatório")
    @Size(max = 200)
    String name,
    
    String description,
    
    @NotNull(message = "O ID do curso é obrigatório")
    UUID courseId,
    
    @NotNull(message = "O ID do professor responsável é obrigatório")
    UUID responsibleProfessorId
) {}
