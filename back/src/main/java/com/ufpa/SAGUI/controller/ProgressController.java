package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.progress.DisciplineProgressResponse;
import com.ufpa.SAGUI.dto.progress.ModuleProgressResponse;
import com.ufpa.SAGUI.service.ProgressService;

import lombok.RequiredArgsConstructor;

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
    public ResponseEntity<Void> checkModuleAccess(
            @PathVariable UUID moduleId,
            @RequestParam UUID studentId) {

        progressService.validateSequentialAccess(studentId, moduleId);
        return ResponseEntity.ok().build();
    }

    /**
     * M4-08: Progresso do aluno em um módulo específico.
     */
    @GetMapping("/modules/{moduleId}/progress")
    public ResponseEntity<ModuleProgressResponse> getModuleProgress(
            @PathVariable UUID moduleId,
            @RequestParam UUID studentId) {

        ModuleProgressResponse response = progressService.getModuleProgress(studentId, moduleId);
        return ResponseEntity.ok(response);
    }

    /**
     * M4-09: Progresso consolidado do aluno na disciplina.
     */
    @GetMapping("/disciplines/{disciplineId}/progress")
    public ResponseEntity<DisciplineProgressResponse> getDisciplineProgress(
            @PathVariable UUID disciplineId,
            @RequestParam UUID studentId) {

        DisciplineProgressResponse response = progressService.getDisciplineProgress(studentId, disciplineId);
        return ResponseEntity.ok(response);
    }
}