package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.enrollment.EnrollmentPageResponse;
import com.ufpa.SAGUI.dto.enrollment.EnrollmentRequest;
import com.ufpa.SAGUI.dto.enrollment.EnrollmentResponse;
import com.ufpa.SAGUI.service.EnrollmentService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Matrículas", description = "Solicitação, aprovação e consulta de matrículas")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping
    @PreAuthorize("hasRole('Aluno')")
    public ResponseEntity<EnrollmentResponse> requestEnrollment(@Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.requestEnrollment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<EnrollmentResponse> approveEnrollment(@PathVariable UUID id) {
        return ResponseEntity.ok(enrollmentService.approveEnrollment(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<EnrollmentResponse> rejectEnrollment(@PathVariable UUID id) {
        return ResponseEntity.ok(enrollmentService.rejectEnrollment(id));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('Aluno')")
    public ResponseEntity<EnrollmentResponse> cancelEnrollment(@PathVariable UUID id) {
        return ResponseEntity.ok(enrollmentService.cancelEnrollment(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Professor', 'Admin')")
    public ResponseEntity<EnrollmentPageResponse> listByDiscipline(
            @RequestParam UUID disciplineId,
            @PageableDefault(size = 20, sort = "createdATt") Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.listByDiscipline(disciplineId, pageable));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<EnrollmentPageResponse> listPendingEnrollments(
            @PageableDefault(size = 20, sort = "createdATt") Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.listPendingEnrollments(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('Aluno')")
    public ResponseEntity<EnrollmentPageResponse> listMyEnrollments(
            @PageableDefault(size = 20, sort = "createdATt") Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.listMyEnrollments(pageable));
    }
}
