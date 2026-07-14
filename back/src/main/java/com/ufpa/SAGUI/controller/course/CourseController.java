package com.ufpa.SAGUI.controller.course;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ufpa.SAGUI.dto.course.CourseRequest;
import com.ufpa.SAGUI.dto.course.CourseResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.service.course.CourseService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Cursos", description = "Gestão de cursos")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<CourseResponse>> listCourses(
            @RequestParam(required = false) EntityStatus status,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(courseService.findAll(status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<CourseResponse> createCourse(@RequestBody @Valid CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable UUID id, 
            @RequestBody @Valid CourseRequest request) {
        return ResponseEntity.ok(courseService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID id, 
            @RequestParam EntityStatus status) {
        courseService.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/professors/{profId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> addProfessor(@PathVariable UUID id, @PathVariable UUID profId) {
        courseService.addProfessor(id, profId);
        return ResponseEntity.noContent().build();
    }

}

