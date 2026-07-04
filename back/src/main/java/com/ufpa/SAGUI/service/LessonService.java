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

import com.ufpa.SAGUI.dto.lesson.LessonCompletionResponse;
import com.ufpa.SAGUI.dto.lesson.LessonResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Lesson;
import com.ufpa.SAGUI.models.LessonProgress;
import com.ufpa.SAGUI.models.Module;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.LessonProgressRepository;
import com.ufpa.SAGUI.repository.LessonRepository;
import com.ufpa.SAGUI.repository.ModuleRepository;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final EnrollmentService enrollmentService;
    private final ProgressService progressService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<LessonResponse> findByModule(UUID moduleId, EntityStatus status, Pageable pageable) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modulo nao encontrado"));
        enrollmentService.validateContentAccessForCurrentUser(module.getDiscipline().getId());
        progressService.validateSequentialAccessForCurrentUser(moduleId);

        if (status != null) {
            return lessonRepository.findAllByModule_IdAndStatus(moduleId, status, pageable)
                    .map(LessonResponse::from);
        }

        return lessonRepository.findAllByModule_Id(moduleId, pageable).map(LessonResponse::from);
    }

    @Transactional
    public LessonCompletionResponse completeLessonForCurrentUser(UUID lessonId) {
        User student = findAuthenticatedUser();

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aula não encontrada"));

        Module module = lesson.getModule();
        if (module == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aula sem módulo associado");
        }

        enrollmentService.validateContentAccess(student.getId(), module.getDiscipline().getId());
        progressService.validateSequentialAccess(student.getId(), module.getId());

        LessonProgress progress = lessonProgressRepository
                .findByStudent_IdAndLesson_Id(student.getId(), lessonId)
                .orElseGet(() -> {
                    LessonProgress newProgress = LessonProgress.builder()
                            .student(student)
                            .lesson(lesson)
                            .completed(false)
                            .build();
                    newProgress.setStatus(EntityStatus.Active);
                    return newProgress;
                });

        progress.setCompleted(true);
        lessonProgressRepository.save(progress);

        return LessonCompletionResponse.builder()
                .lessonId(lessonId)
                .completed(true)
                .moduleProgress(progressService.getModuleProgress(student.getId(), module.getId()))
                .build();
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
}
