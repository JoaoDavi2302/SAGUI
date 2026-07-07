package com.ufpa.SAGUI.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.progress.DisciplineProgressResponse;
import com.ufpa.SAGUI.dto.progress.ModuleProgressResponse;
import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.models.Enrollment;
import com.ufpa.SAGUI.models.Module;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.EnrollmentRepository;
import com.ufpa.SAGUI.repository.LessonProgressRepository;
import com.ufpa.SAGUI.repository.LessonRepository;
import com.ufpa.SAGUI.repository.ModuleRepository;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    // ==========================================================
    // M4-07: Progressão sequencial entre módulos
    // ==========================================================

    @Transactional(readOnly = true)
    public void validateSequentialAccessForCurrentUser(UUID moduleId) {
        validateSequentialAccess(getCurrentStudentId(), moduleId);
    }

    @Transactional(readOnly = true)
    public void validateSequentialAccess(UUID studentId, UUID moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Módulo não encontrado com o ID: " + moduleId));

        Enrollment enrollment = getApprovedEnrollment(studentId, module.getDiscipline().getId());

        if (!isModuleUnlocked(enrollment, module)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Acesso negado: é necessário concluir o módulo anterior antes de acessar este módulo.");
        }
    }

    /**
     * Versão booleana da regra, para uso interno e montagem dos DTOs.
     */
    @Transactional(readOnly = true)
    public boolean isModuleUnlocked(Enrollment enrollment, Module module) {
        Optional<Module> previousModule = moduleRepository
                .findFirstByDiscipline_IdAndOrderIndexLessThanOrderByOrderIndexDesc(
                        module.getDiscipline().getId(), module.getOrderIndex());

        // Primeiro módulo da disciplina: sempre liberado
        if (previousModule.isEmpty()) {
            return true;
        }

        return isModuleCompletedByLessons(enrollment.getStudent().getId(), previousModule.get().getId());
    }

    // ==========================================================
    // M4-08: Progresso do aluno no módulo (calculado pelas aulas)
    // ==========================================================

    @Transactional(readOnly = true)
    public ModuleProgressResponse getModuleProgressForCurrentUser(UUID moduleId) {
        return getModuleProgress(getCurrentStudentId(), moduleId);
    }

    @Transactional(readOnly = true)
    public ModuleProgressResponse getModuleProgress(UUID studentId, UUID moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Módulo não encontrado com o ID: " + moduleId));

        Enrollment enrollment = getApprovedEnrollment(studentId, module.getDiscipline().getId());

        return buildModuleResponse(module, studentId, isModuleUnlocked(enrollment, module));
    }

    // ==========================================================
    // M4-09: Progresso consolidado do aluno na disciplina
    // ==========================================================

    @Transactional(readOnly = true)
    public DisciplineProgressResponse getDisciplineProgressForCurrentUser(UUID disciplineId) {
        return getDisciplineProgress(getCurrentStudentId(), disciplineId);
    }

    @Transactional(readOnly = true)
    public DisciplineProgressResponse getDisciplineProgress(UUID studentId, UUID disciplineId) {
        Enrollment enrollment = getApprovedEnrollment(studentId, disciplineId);

        List<Module> modules = moduleRepository.findByDiscipline_IdOrderByOrderIndexAsc(disciplineId);

        if (modules.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "A disciplina não possui módulos cadastrados.");
        }

        List<ModuleProgressResponse> moduleResponses = modules.stream()
                .map(module -> buildModuleResponse(
                        module,
                        studentId,
                        isModuleUnlocked(enrollment, module)))
                .collect(Collectors.toList());

        int totalModules = modules.size();

        int completedModules = (int) moduleResponses.stream()
                .filter(ModuleProgressResponse::isCompleted)
                .count();

        // Consolidado: média dos percentuais (módulos sem progresso contam como 0)
        int overallPercentage = (int) Math.round(moduleResponses.stream()
                .mapToInt(ModuleProgressResponse::getProgressPercentage)
                .average()
                .orElse(0));

        return DisciplineProgressResponse.builder()
                .disciplineId(disciplineId)
                .disciplineName(modules.get(0).getDiscipline().getName())
                .totalModules(totalModules)
                .completedModules(completedModules)
                .overallPercentage(overallPercentage)
                .modules(moduleResponses)
                .build();
    }

    // ==========================================================
    // Auxiliares
    // ==========================================================

    private int calculateLessonProgressPercentage(UUID studentId, UUID moduleId) {
        long totalLessons = lessonRepository.countByModule_Id(moduleId);
        if (totalLessons == 0) {
            return 0;
        }

        long completedLessons = lessonProgressRepository
                .countByStudent_IdAndLesson_Module_IdAndCompletedTrue(studentId, moduleId);

        return (int) Math.round((completedLessons * 100.0) / totalLessons);
    }

    private boolean isModuleCompletedByLessons(UUID studentId, UUID moduleId) {
        long totalLessons = lessonRepository.countByModule_Id(moduleId);
        if (totalLessons == 0) {
            return false;
        }

        long completedLessons = lessonProgressRepository
                .countByStudent_IdAndLesson_Module_IdAndCompletedTrue(studentId, moduleId);

        return completedLessons == totalLessons;
    }

    private UUID getCurrentStudentId() {
        return findAuthenticatedUser().getId();
    }

    private User findAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário não autenticado");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Usuário autenticado não encontrado"));
    }

    private Enrollment getApprovedEnrollment(UUID studentId, UUID disciplineId) {
        return enrollmentRepository
                .findByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
                        studentId, disciplineId, EnrollmentStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Acesso negado: o aluno não possui uma matrícula aprovada nesta disciplina."));
    }

    private ModuleProgressResponse buildModuleResponse(Module module, UUID studentId, boolean unlocked) {
        return ModuleProgressResponse.builder()
                .moduleId(module.getId())
                .moduleName(module.getName())
                .orderIndex(module.getOrderIndex())
                .progressPercentage(calculateLessonProgressPercentage(studentId, module.getId()))
                .completed(isModuleCompletedByLessons(studentId, module.getId()))
                .unlocked(unlocked)
                .build();
    }
}
