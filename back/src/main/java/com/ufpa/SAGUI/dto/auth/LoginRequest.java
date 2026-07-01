package com.ufpa.SAGUI.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank(message = "Email Obrigatório")
    @Size(max = 100)
    @Email(message = "Email Inválido")
    String email, 

    @NotBlank(message = "Senha Obrigatória")
    @Size(min = 6, message = "Senha deve ter mais de 6 caracteres")
    String password
) {}
