package com.ufpa.SAGUI.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.attachment.AttachmentRequest;
import com.ufpa.SAGUI.dto.attachment.AttachmentResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.service.AttachmentService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Materiais", description = "Anexos e materiais das aulas")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttachmentResponse>> listByLesson(
            @RequestParam UUID lessonId,
            @RequestParam(required = false) EntityStatus status) {
        return ResponseEntity.ok(attachmentService.findByLesson(lessonId, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttachmentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(attachmentService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<AttachmentResponse> create(@RequestBody @Valid AttachmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attachmentService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<AttachmentResponse> update(
            @PathVariable UUID id,
            @RequestBody @Valid AttachmentRequest request) {
        return ResponseEntity.ok(attachmentService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID id,
            @RequestParam EntityStatus status) {
        attachmentService.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        attachmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
