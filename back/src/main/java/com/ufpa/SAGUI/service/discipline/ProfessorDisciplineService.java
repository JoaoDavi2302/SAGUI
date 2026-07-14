package com.ufpa.SAGUI.service.discipline;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.activity.PendingActivityPageResponse;
import com.ufpa.SAGUI.dto.activity.PendingActivityResponse;
import com.ufpa.SAGUI.dto.progress.DisciplineProgressResponse;
import com.ufpa.SAGUI.dto.progress.StudentProgressSummaryPageResponse;
import com.ufpa.SAGUI.dto.progress.StudentProgressSummaryResponse;
import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.activity.Activity;
import com.ufpa.SAGUI.models.discipline.Discipline;
import com.ufpa.SAGUI.models.enrollment.Enrollment;
import com.ufpa.SAGUI.models.module.Module;
import com.ufpa.SAGUI.repository.activity.ActivityAttemptRepository;
import com.ufpa.SAGUI.repository.discipline.DisciplineRepository;
import com.ufpa.SAGUI.repository.enrollment.EnrollmentRepository;

import lombok.RequiredArgsConstructor;

import com.ufpa.SAGUI.service.progress.ProgressService;
import com.ufpa.SAGUI.service.security.ProfessorAuthorizationService;
@Service
@RequiredArgsConstructor
public class ProfessorDisciplineService {

    private final DisciplineRepository disciplineRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ActivityAttemptRepository activityAttemptRepository;
    private final ProgressService progressService;
    private final ProfessorAuthorizationService professorAuthorizationService;

    @Transactional(readOnly = true)
    public DisciplineProgressResponse getEnrollmentProgress(UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findWithStudentAndDisciplineById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Matricula nao encontrada com o ID: " + enrollmentId));

        if (enrollment.getEnrollmentStatus() != EnrollmentStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Progresso disponivel apenas para matriculas aprovadas.");
        }

        Discipline discipline = enrollment.getDiscipline();
        if (discipline == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Matricula sem disciplina associada.");
        }

        professorAuthorizationService.validateProfessorOrAdminCanAccessDiscipline(discipline);

        return progressService.getDisciplineProgress(
                enrollment.getStudent().getId(),
                discipline.getId());
    }

    @Transactional(readOnly = true)
    public StudentProgressSummaryPageResponse getDisciplineStudentsProgress(
            UUID disciplineId,
            Pageable pageable
    ) {
        Discipline discipline = disciplineRepository.findById(disciplineId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Disciplina nao encontrada com o ID: " + disciplineId));

        professorAuthorizationService.validateProfessorOrAdminCanAccessDiscipline(discipline);

        Page<Enrollment> enrollments = enrollmentRepository
                .findByDiscipline_IdAndEnrollmentStatusAndStatus(
                        disciplineId, EnrollmentStatus.APPROVED, EntityStatus.Active, pageable);

        List<StudentProgressSummaryResponse> content = enrollments.getContent().stream()
                .map(enrollment -> {
                    DisciplineProgressResponse progress = progressService.getDisciplineProgress(
                            enrollment.getStudent().getId(),
                            disciplineId);

                    return new StudentProgressSummaryResponse(
                            enrollment.getStudent().getId(),
                            enrollment.getStudent().getName(),
                            enrollment.getStudent().getEmail(),
                            progress.getOverallPercentage(),
                            progress.getCompletedModules(),
                            progress.getTotalModules());
                })
                .toList();

        return StudentProgressSummaryPageResponse.from(enrollments, content);
    }

    @Transactional(readOnly = true)
    public PendingActivityPageResponse listPendingActivities(UUID disciplineId, Pageable pageable) {
        Discipline discipline = disciplineRepository.findById(disciplineId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Disciplina nao encontrada com o ID: " + disciplineId));

        professorAuthorizationService.validateProfessorOrAdminCanAccessDiscipline(discipline);

        Page<Object[]> pendingRows = enrollmentRepository.findPendingStudentActivities(disciplineId, pageable);

        List<PendingActivityResponse> content = pendingRows.getContent().stream()
                .map(this::toPendingActivityResponse)
                .toList();

        return PendingActivityPageResponse.from(pendingRows, content);
    }

    private PendingActivityResponse toPendingActivityResponse(Object[] row) {
        Enrollment enrollment = (Enrollment) row[0];
        Activity activity = (Activity) row[1];
        Module module = (Module) row[2];

        UUID studentId = enrollment.getStudent().getId();
        UUID activityId = activity.getId();

        long attemptsUsed = activityAttemptRepository.countByStudentIdAndActivityId(studentId, activityId);
        Double bestScore = activityAttemptRepository.findBestScoreByStudentIdAndActivityId(studentId, activityId);

        return new PendingActivityResponse(
                studentId,
                enrollment.getStudent().getName(),
                activityId,
                activity.getTitle(),
                module.getId(),
                module.getName(),
                (int) attemptsUsed,
                activity.getAttemptLimit(),
                bestScore);
    }
}
