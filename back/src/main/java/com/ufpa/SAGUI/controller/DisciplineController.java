package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ufpa.SAGUI.dto.discipline.DisciplineRequest;
import com.ufpa.SAGUI.dto.discipline.DisciplineResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.service.DisciplineService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/disciplines")
@RequiredArgsConstructor
public class DisciplineController {

    private final DisciplineService disciplineService;

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
}


