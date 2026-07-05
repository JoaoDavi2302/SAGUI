package com.ufpa.SAGUI.dto.auth;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
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
    @Size(min = 6, message = "Senha deve ter mais de 6 caracteres")
    String password,

    @Past(message = "Data de nascimento inválida")
    LocalDate birthDate,

    @Size(max = 300, message = "Endereço deve ter no máximo 300 caracteres")
    String address
) {}