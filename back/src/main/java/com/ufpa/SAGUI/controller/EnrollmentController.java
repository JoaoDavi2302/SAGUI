package com.ufpa.SAGUI.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.enrollment.EnrollmentRequest;
import com.ufpa.SAGUI.dto.enrollment.EnrollmentResponse;
import com.ufpa.SAGUI.service.EnrollmentService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Matrículas", description = "Solicitação e aprovação de matrículas")
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
    public ResponseEntity<EnrollmentResponse> approveEnrollment(@PathVariable java.util.UUID id) {
        EnrollmentResponse response = enrollmentService.approveEnrollment(id);
        return ResponseEntity.ok(response);
    }
}
