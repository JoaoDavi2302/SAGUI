package com.ufpa.SAGUI.dto.module;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ModuleRequest(
    @NotBlank(message = "O nome do modulo e obrigatorio")
    @Size(max = 200)
    String name,

    String description,

    @NotNull(message = "A ordem do modulo e obrigatoria")
    Integer orderIndex,

    @NotNull(message = "O ID da disciplina e obrigatorio")
    UUID disciplineId
) {}
