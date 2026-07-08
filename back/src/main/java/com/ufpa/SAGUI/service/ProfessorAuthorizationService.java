package com.ufpa.SAGUI.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.Activity;
import com.ufpa.SAGUI.models.Discipline;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfessorAuthorizationService {

    private final UserRepository userRepository;

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao autenticado");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Usuario autenticado nao encontrado"));
    }

    public void validateProfessorOrAdminCanAccessDiscipline(Discipline discipline) {
        User user = getAuthenticatedUser();

        if (user.getRole() == UserRole.Admin) {
            return;
        }

        if (user.getRole() != UserRole.Professor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        validateResponsibleProfessor(user, discipline);
    }

    public void validateProfessorCanManageDiscipline(Discipline discipline) {
        User user = getAuthenticatedUser();

        if (user.getRole() == UserRole.Admin) {
            return;
        }

        if (user.getRole() != UserRole.Professor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        validateResponsibleProfessor(user, discipline);
    }

    public void validateProfessorOrAdminCanAccessActivity(Activity activity) {
        if (activity.getModule() == null || activity.getModule().getDiscipline() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Atividade sem modulo ou disciplina associada");
        }

        validateProfessorOrAdminCanAccessDiscipline(activity.getModule().getDiscipline());
    }

    public void validateProfessorCanManageActivity(Activity activity) {
        if (activity.getModule() == null || activity.getModule().getDiscipline() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Atividade sem modulo ou disciplina associada");
        }

        validateProfessorCanManageDiscipline(activity.getModule().getDiscipline());
    }

    private void validateResponsibleProfessor(User user, Discipline discipline) {
        User responsibleProfessor = discipline.getResponsibleProfessor();

        if (responsibleProfessor == null || !responsibleProfessor.getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Professor nao autorizado para esta disciplina");
        }
    }
}
