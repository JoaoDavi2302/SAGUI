package com.ufpa.SAGUI.dto.user;

import java.time.LocalDate;

import com.ufpa.SAGUI.enums.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    String name,

    @NotBlank(message = "Email é obrigatório")
    @Size(max = 200, message = "Email deve ter no máximo 200 caracteres")
    @Email(message = "Email inválido")
    String email,

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    String password,

    @NotNull(message = "Perfil é obrigatório")
    UserRole role,

    @Past(message = "Data de nascimento inválida")
    LocalDate birthDate,

    @Size(max = 300, message = "Endereço deve ter no máximo 300 caracteres")
    String address
) {}
