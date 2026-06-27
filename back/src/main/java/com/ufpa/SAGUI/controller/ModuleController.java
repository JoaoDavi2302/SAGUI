package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.module.ModuleRequest;
import com.ufpa.SAGUI.dto.module.ModuleResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.service.ModuleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ModuleResponse>> listModules(
            @RequestParam(required = false) UUID disciplineId,
            @RequestParam(required = false) EntityStatus status,
            @PageableDefault(size = 20, sort = "orderIndex") Pageable pageable) {
        return ResponseEntity.ok(moduleService.findAll(disciplineId, status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ModuleResponse> getModule(@PathVariable UUID id) {
        return ResponseEntity.ok(moduleService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<ModuleResponse> createModule(@RequestBody @Valid ModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<ModuleResponse> updateModule(
            @PathVariable UUID id,
            @RequestBody @Valid ModuleRequest request) {
        return ResponseEntity.ok(moduleService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID id,
            @RequestParam EntityStatus status) {
        moduleService.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
