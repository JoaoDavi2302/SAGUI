package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.progress.DisciplineProgressResponse;
import com.ufpa.SAGUI.dto.progress.ModuleProgressResponse;
import com.ufpa.SAGUI.service.ProgressService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Progresso", description = "Progressão e progresso do aluno")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    /**
     * M4-07: Verifica a progressão sequencial.
     * Retorna 200 se o módulo estiver liberado para o aluno;
     * caso contrário o service lança exceção (acesso negado).
     */
    @GetMapping("/modules/{moduleId}/access")
    @PreAuthorize("hasRole('Aluno')")
    public ResponseEntity<Void> checkModuleAccess(@PathVariable UUID moduleId) {
        progressService.validateSequentialAccessForCurrentUser(moduleId);
        return ResponseEntity.ok().build();
    }

    /**
     * M4-08: Progresso do aluno em um módulo específico.
     */
    @GetMapping("/modules/{moduleId}/progress")
    @PreAuthorize("hasRole('Aluno')")
    public ResponseEntity<ModuleProgressResponse> getModuleProgress(@PathVariable UUID moduleId) {
        return ResponseEntity.ok(progressService.getModuleProgressForCurrentUser(moduleId));
    }

    /**
     * M4-09: Progresso consolidado do aluno na disciplina.
     */
    @GetMapping("/disciplines/{disciplineId}/progress")
    @PreAuthorize("hasRole('Aluno')")
    public ResponseEntity<DisciplineProgressResponse> getDisciplineProgress(@PathVariable UUID disciplineId) {
        return ResponseEntity.ok(progressService.getDisciplineProgressForCurrentUser(disciplineId));
    }
}
