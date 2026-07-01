package com.ufpa.SAGUI.dto.enrollment;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EnrollmentRequest {
    @NotNull(message = "O ID do aluno é obrigatório")
    private UUID studentId;

    @NotNull(message = "O ID da disciplina é obrigatório")
    private UUID disciplineId;

    private UUID courseId; 
}
