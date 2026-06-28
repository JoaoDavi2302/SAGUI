package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.lesson.LessonResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.service.LessonService;

import lombok.RequiredArgsConstructor;

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
}
