package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ufpa.SAGUI.dto.activity.PendingActivityPageResponse;
import com.ufpa.SAGUI.dto.discipline.DisciplineRequest;
import com.ufpa.SAGUI.dto.discipline.DisciplineResponse;
import com.ufpa.SAGUI.dto.progress.StudentProgressSummaryPageResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.service.DisciplineService;
import com.ufpa.SAGUI.service.ProfessorDisciplineService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Disciplinas", description = "Gestão de disciplinas")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/disciplines")
@RequiredArgsConstructor
public class DisciplineController {

    private final DisciplineService disciplineService;
    private final ProfessorDisciplineService professorDisciplineService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<DisciplineResponse>> listDisciplines(
            @RequestParam(required = false) UUID courseId,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(disciplineService.findAll(courseId, pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<DisciplineResponse> createDiscipline(@RequestBody @Valid DisciplineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(disciplineService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<DisciplineResponse> updateDiscipline(
            @PathVariable UUID id, 
            @RequestBody @Valid DisciplineRequest request) {
        return ResponseEntity.ok(disciplineService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID id, 
            @RequestParam EntityStatus status) {
        disciplineService.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DisciplineResponse> getDiscipline(@PathVariable UUID id) {
        return ResponseEntity.ok(disciplineService.findById(id));
    }

    @GetMapping("/{id}/students/progress")
    @PreAuthorize("hasAnyRole('Professor', 'Admin')")
    public ResponseEntity<StudentProgressSummaryPageResponse> getDisciplineStudentsProgress(
            @PathVariable UUID id,
            @PageableDefault(size = 20, sort = "createdATt") Pageable pageable) {
        return ResponseEntity.ok(professorDisciplineService.getDisciplineStudentsProgress(id, pageable));
    }

    @GetMapping("/{id}/pending-activities")
    @PreAuthorize("hasAnyRole('Professor', 'Admin')")
    public ResponseEntity<PendingActivityPageResponse> listPendingActivities(
            @PathVariable UUID id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(professorDisciplineService.listPendingActivities(id, pageable));
    }
}


