package com.ufpa.SAGUI.dto.user;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    String name, LocalDate birthDate,

    String address,

    @Email(message = "Email inválido")
    String email,

    String currentPassword,

    @Size(min = 6, message = "Nova senha deve ter no mínimo 6 caracteres")
    String newPassword
) {}
