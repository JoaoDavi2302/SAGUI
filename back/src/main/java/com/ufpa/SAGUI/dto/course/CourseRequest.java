package com.ufpa.SAGUI.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CourseRequest(
    @NotBlank(message = "O nome do curso é obrigatório")
    @Size(max = 200)
    String name,
    
    String description
) {}
