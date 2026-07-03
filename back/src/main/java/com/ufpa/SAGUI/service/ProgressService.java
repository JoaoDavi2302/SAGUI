package com.ufpa.SAGUI.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.progress.DisciplineProgressResponse;
import com.ufpa.SAGUI.dto.progress.ModuleProgressResponse;
import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.models.Enrollment;
import com.ufpa.SAGUI.models.Module;
import com.ufpa.SAGUI.models.ModuleProgress;
import com.ufpa.SAGUI.repository.EnrollmentRepository;
import com.ufpa.SAGUI.repository.ModuleProgressRepository;
import com.ufpa.SAGUI.repository.ModuleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ModuleRepository moduleRepository;
    private final ModuleProgressRepository moduleProgressRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ==========================================================
    // M4-07: Progressão sequencial entre módulos
    // ==========================================================

    /**
     * Valida se o aluno pode acessar o módulo informado.
     * Regra: o módulo só é liberado se o módulo anterior da mesma
     * disciplina (pelo orderIndex) estiver concluído. O primeiro
     * módulo da disciplina é sempre liberado.
     *
     * Lança 403 (Forbidden) se o acesso não for permitido.
     */
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

        return moduleProgressRepository
                .findByEnrollment_IdAndModule_Id(enrollment.getId(), previousModule.get().getId())
                .map(ModuleProgress::isCompleted)
                .orElse(false);
    }

    // ==========================================================
    // M4-08: Progresso do aluno no módulo
    // ==========================================================

    @Transactional(readOnly = true)
    public ModuleProgressResponse getModuleProgress(UUID studentId, UUID moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Módulo não encontrado com o ID: " + moduleId));

        Enrollment enrollment = getApprovedEnrollment(studentId, module.getDiscipline().getId());

        Optional<ModuleProgress> progress = moduleProgressRepository
                .findByEnrollment_IdAndModule_Id(enrollment.getId(), moduleId);

        return buildModuleResponse(module, progress.orElse(null), isModuleUnlocked(enrollment, module));
    }

    // ==========================================================
    // M4-09: Progresso consolidado do aluno na disciplina
    // ==========================================================

    @Transactional(readOnly = true)
    public DisciplineProgressResponse getDisciplineProgress(UUID studentId, UUID disciplineId) {
        Enrollment enrollment = getApprovedEnrollment(studentId, disciplineId);

        List<Module> modules = moduleRepository.findByDiscipline_IdOrderByOrderIndexAsc(disciplineId);

        if (modules.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "A disciplina não possui módulos cadastrados.");
        }

        // Busca todos os progressos da matrícula de uma vez e indexa por módulo
        Map<UUID, ModuleProgress> progressByModuleId = moduleProgressRepository
                .findByEnrollment_Id(enrollment.getId())
                .stream()
                .collect(Collectors.toMap(mp -> mp.getModule().getId(), Function.identity()));

        List<ModuleProgressResponse> moduleResponses = modules.stream()
                .map(module -> buildModuleResponse(
                        module,
                        progressByModuleId.get(module.getId()),
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

    private Enrollment getApprovedEnrollment(UUID studentId, UUID disciplineId) {
        return enrollmentRepository
                .findByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
                        studentId, disciplineId, EnrollmentStatus.APPROVED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Acesso negado: o aluno não possui uma matrícula aprovada nesta disciplina."));
    }

    private ModuleProgressResponse buildModuleResponse(Module module, ModuleProgress progress, boolean unlocked) {
        return ModuleProgressResponse.builder()
                .moduleId(module.getId())
                .moduleName(module.getName())
                .orderIndex(module.getOrderIndex())
                .progressPercentage(progress != null ? progress.getProgressPercentage() : 0)
                .completed(progress != null && progress.isCompleted())
                .unlocked(unlocked)
                .build();
    }
}