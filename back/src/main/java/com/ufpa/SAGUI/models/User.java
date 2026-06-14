package com.ufpa.SAGUI.models;

import java.time.LocalDate;
import java.time.LocalDateTime;


import com.ufpa.SAGUI.enums.UserRole;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
    @NotBlank
    private String name;
    
    @Column(unique = true, nullable = false)
    @NotBlank
    @Email
    private String email;

    // Diferencia os acessos de usuario
    // Aluno, Professor, Adm
    @Enumerated(EnumType.STRING)
    @NotNull
    private UserRole role;

    @NotNull
    private LocalDate birthDate;

    private String address;
    private String passwordHash;
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    // Falta implementar os métodos
}
