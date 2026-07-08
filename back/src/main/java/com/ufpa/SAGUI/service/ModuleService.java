package com.ufpa.SAGUI.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.module.ModuleRequest;
import com.ufpa.SAGUI.dto.module.ModuleResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.Discipline;
import com.ufpa.SAGUI.models.Module;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.DisciplineRepository;
import com.ufpa.SAGUI.repository.ModuleRepository;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final DisciplineRepository disciplineRepository;
    private final UserRepository userRepository;
    private final EnrollmentService enrollmentService;

    public ModuleResponse create(ModuleRequest dto) {
        Discipline discipline = getDisciplineEntity(dto.disciplineId());
        validateResponsibleProfessor(discipline);

        Module module = Module.builder()
                .name(dto.name())
                .description(dto.description())
                .orderIndex(dto.orderIndex())
                .discipline(discipline)
                .build();
        module.setStatus(EntityStatus.Active);

        return ModuleResponse.from(moduleRepository.save(module));
    }

    public ModuleResponse update(UUID id, ModuleRequest dto) {
        Module module = getModuleEntity(id);
        validateResponsibleProfessor(module.getDiscipline());

        Discipline discipline = getDisciplineEntity(dto.disciplineId());
        validateResponsibleProfessor(discipline);

        module.setName(dto.name());
        module.setDescription(dto.description());
        module.setOrderIndex(dto.orderIndex());
        module.setDiscipline(discipline);

        return ModuleResponse.from(moduleRepository.save(module));
    }

    public void changeStatus(UUID id, EntityStatus status) {
        Module module = getModuleEntity(id);
        validateResponsibleProfessor(module.getDiscipline());
        module.setStatus(status);
        moduleRepository.save(module);
    }

    @Transactional(readOnly = true)
    public Page<ModuleResponse> findAll(UUID disciplineId, EntityStatus status, Pageable pageable) {
        User user = findAuthenticatedUser();
        if (user.getRole() == UserRole.Aluno && disciplineId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "disciplineId é obrigatório");
        }

        if (disciplineId != null) {
            enrollmentService.validateContentAccessForCurrentUser(disciplineId);
        }

        EntityStatus filterStatus = status != null ? status : EntityStatus.Active;

        if (disciplineId != null) {
            return moduleRepository.findAllByDiscipline_IdAndStatus(disciplineId, filterStatus, pageable)
                    .map(ModuleResponse::from);
        }

        return moduleRepository.findAllByStatus(filterStatus, pageable).map(ModuleResponse::from);
    }

    @Transactional(readOnly = true)
    public ModuleResponse findById(UUID id) {
        Module module = getModuleEntity(id);
        enrollmentService.validateContentAccessForCurrentUser(module.getDiscipline().getId());
        return ModuleResponse.from(module);
    }

    private Module getModuleEntity(UUID id) {
        return moduleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modulo nao encontrado"));
    }

    private Discipline getDisciplineEntity(UUID id) {
        return disciplineRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina nao encontrada"));
    }

    private void validateResponsibleProfessor(Discipline discipline) {
        User authenticatedUser = findAuthenticatedUser();
        User responsibleProfessor = discipline.getResponsibleProfessor();

        if (responsibleProfessor == null || !responsibleProfessor.getId().equals(authenticatedUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Professor nao autorizado para esta disciplina");
        }
    }

    private User findAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao autenticado");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario autenticado nao encontrado"));
    }
}
