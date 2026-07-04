package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.lesson.LessonCompletionResponse;
import com.ufpa.SAGUI.dto.lesson.LessonResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.service.LessonService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Aulas", description = "Consulta e conclusão de aulas")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<LessonResponse>> listLessonsByModule(
            @RequestParam UUID moduleId,
            @RequestParam(required = false) EntityStatus status,
            @PageableDefault(size = 20, sort = "orderIndex") Pageable pageable) {
        return ResponseEntity.ok(lessonService.findByModule(moduleId, status, pageable));
    }

    @PostMapping
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<LessonResponse> createLesson(@RequestBody @Valid LessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lessonService.createLesson(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<LessonResponse> updateLesson(@PathVariable UUID id, @RequestBody @Valid LessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<Void> changeStatus(@PathVariable UUID id, @RequestParam EntityStatus status) {
        lessonService.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('Aluno')")
    public ResponseEntity<LessonCompletionResponse> completeLesson(@PathVariable UUID id) {
        return ResponseEntity.ok(lessonService.completeLessonForCurrentUser(id));
    }
}
