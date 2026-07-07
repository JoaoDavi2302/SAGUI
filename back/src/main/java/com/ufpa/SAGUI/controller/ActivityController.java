package com.ufpa.SAGUI.controller;

import com.ufpa.SAGUI.dto.activity.ActivityRequest;
import com.ufpa.SAGUI.dto.activity.ActivityResponse;
import com.ufpa.SAGUI.dto.activity.ActivitySubmissionRequest;
import com.ufpa.SAGUI.dto.activity.ActivityAttemptResultResponse;
import com.ufpa.SAGUI.service.ActivityService;
import com.ufpa.SAGUI.service.ActivityAttemptService;
import com.ufpa.SAGUI.enums.EntityStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;
    private final ActivityAttemptService activityAttemptService;

    public ActivityController(
            ActivityService activityService,
            ActivityAttemptService activityAttemptService
    ) {
        this.activityService = activityService;
        this.activityAttemptService = activityAttemptService;
    }

    // Criar atividade com questões e alternativas
    @PostMapping
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<ActivityResponse> createActivity(
            @RequestBody ActivityRequest request
    ) {
        ActivityResponse response = activityService.createActivity(request);
        return ResponseEntity.ok(response);
    }

    // Listar atividades (por padrão, apenas ativas)
    @GetMapping
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<List<ActivityResponse>> getAllActivities(
            @RequestParam(required = false) EntityStatus status,
            @RequestParam(required = false) UUID moduleId
    ) {
        List<ActivityResponse> response = activityService.getAllActivities(status, moduleId);
        return ResponseEntity.ok(response);
    }

    // Buscar atividade por ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<ActivityResponse> getActivityById(
            @PathVariable UUID id
    ) {
        ActivityResponse response = activityService.getActivityById(id);
        return ResponseEntity.ok(response);
    }

    // Atualizar atividade
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<ActivityResponse> updateActivity(
            @PathVariable UUID id,
            @RequestBody ActivityRequest request
    ) {
        ActivityResponse response = activityService.updateActivity(id, request);
        return ResponseEntity.ok(response);
    }

    // Inativar atividade (exclusão lógica)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Professor')")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable UUID id
    ) {
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }

    // Aluno submete respostas da atividade
    @PostMapping("/{id}/submissions")
    @PreAuthorize("hasRole('Aluno')")
    public ResponseEntity<ActivityAttemptResultResponse> submitActivity(
            @PathVariable UUID id,
            @RequestBody ActivitySubmissionRequest request
    ) {
        ActivityAttemptResultResponse response = activityAttemptService.submitActivity(id, request);
        return ResponseEntity.ok(response);
    }
}
