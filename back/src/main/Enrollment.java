package com.ufpa.SAGUI.models;

import com.ufpa.SAGUI.enums.EnrollmentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment extends BaseEntity {

    // Relacionamento com o Aluno (User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private User student; 

    // Relacionamento com o Curso (pode ser nulo se for matrícula em disciplina)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id")
    private Course course; 

    // Relacionamento com a Disciplina (pode ser nulo se for matrícula em curso)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id")
    private Discipline discipline; 

    // Status da matrícula (PENDING, APPROVED, etc.)
    // Nomeado como enrollmentStatus para não conflitar com o status da BaseEntity
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus enrollmentStatus;
}