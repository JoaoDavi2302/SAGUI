package com.ufpa.SAGUI.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Nome é Obrigatório")
    @Size(max = 100)
    String name,
    
    @NotBlank(message = "Email é Obrigatório")
    @Size(max = 200)
    @Email(message = "Email Inválido")
    String email,

    @NotBlank(message = "Senha é Obrigatória")
    String password        
) {}