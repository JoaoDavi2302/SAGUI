package com.ufpa.SAGUI.controller;

import com.ufpa.SAGUI.dto.activity.ActivityAttemptDetailResponse;
import com.ufpa.SAGUI.dto.activity.ActivityAttemptPageResponse;
import com.ufpa.SAGUI.dto.activity.ActivityAttemptResultResponse;
import com.ufpa.SAGUI.dto.activity.ActivityRequest;
import com.ufpa.SAGUI.dto.activity.ActivityResponse;
import com.ufpa.SAGUI.dto.activity.ActivitySubmissionRequest;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.service.ActivityAttemptService;
import com.ufpa.SAGUI.service.ActivityService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    @PreAuthorize("hasAnyRole('Professor', 'Admin')")
    public ResponseEntity<ActivityResponse> getActivityById(
            @PathVariable UUID id
    ) {
        ActivityResponse response = activityService.getActivityById(id);
        return ResponseEntity.ok(response);
    }

    // Listar tentativas de uma atividade (professor/admin)
    @GetMapping("/{id}/attempts")
    @PreAuthorize("hasAnyRole('Professor', 'Admin')")
    public ResponseEntity<ActivityAttemptPageResponse> listAttempts(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID studentId,
            @RequestParam(required = false) Boolean approved,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        ActivityAttemptPageResponse response = activityAttemptService.listAttempts(
                id, studentId, approved, pageable);
        return ResponseEntity.ok(response);
    }

    // Detalhe de uma tentativa com gabarito (professor/admin)
    @GetMapping("/{id}/attempts/{attemptId}")
    @PreAuthorize("hasAnyRole('Professor', 'Admin')")
    public ResponseEntity<ActivityAttemptDetailResponse> getAttemptDetail(
            @PathVariable UUID id,
            @PathVariable UUID attemptId
    ) {
        ActivityAttemptDetailResponse response = activityAttemptService.getAttemptDetail(id, attemptId);
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
