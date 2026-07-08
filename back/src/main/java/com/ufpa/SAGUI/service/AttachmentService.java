package com.ufpa.SAGUI.service;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.attachment.AttachmentRequest;
import com.ufpa.SAGUI.dto.attachment.AttachmentResponse;
import com.ufpa.SAGUI.enums.AttachmentType;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.Attachment;
import com.ufpa.SAGUI.models.Discipline;
import com.ufpa.SAGUI.models.Lesson;
import com.ufpa.SAGUI.models.Module;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.AttachmentRepository;
import com.ufpa.SAGUI.repository.LessonRepository;
import com.ufpa.SAGUI.repository.UserRepository;
import com.ufpa.SAGUI.util.YouTubeUrlValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentService enrollmentService;
    private final ProgressService progressService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AttachmentResponse> findByLesson(UUID lessonId, EntityStatus status) {
        Lesson lesson = getLessonEntity(lessonId);
        validateReadAccess(lesson);

        EntityStatus filterStatus = status != null ? status : EntityStatus.Active;
        return attachmentRepository.findAllByLesson_IdAndStatus(lessonId, filterStatus)
                .stream()
                .map(AttachmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttachmentResponse findById(UUID id) {
        Attachment attachment = getAttachmentEntity(id);
        validateReadAccess(attachment.getLesson());
        return AttachmentResponse.from(attachment);
    }

    @Transactional
    public AttachmentResponse create(AttachmentRequest request) {
        Lesson lesson = getLessonEntity(request.lessonId());
        validateResponsibleProfessor(lesson.getModule().getDiscipline());
        validateLessonActive(lesson);
        validateFileUrl(request.attachmentType(), request.fileUrl());

        Attachment attachment = Attachment.builder()
                .name(request.name())
                .fileUrl(request.fileUrl().trim())
                .attachmentType(request.attachmentType())
                .lesson(lesson)
                .module(lesson.getModule())
                .build();
        attachment.setStatus(EntityStatus.Active);

        return AttachmentResponse.from(attachmentRepository.save(attachment));
    }

    @Transactional
    public AttachmentResponse update(UUID id, AttachmentRequest request) {
        Attachment attachment = getAttachmentEntity(id);
        Lesson lesson = attachment.getLesson();
        validateResponsibleProfessor(lesson.getModule().getDiscipline());
        validateFileUrl(request.attachmentType(), request.fileUrl());

        if (!lesson.getId().equals(request.lessonId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Não é permitido mover o material para outra aula");
        }

        attachment.setName(request.name());
        attachment.setFileUrl(request.fileUrl().trim());
        attachment.setAttachmentType(request.attachmentType());

        return AttachmentResponse.from(attachmentRepository.save(attachment));
    }

    @Transactional
    public void changeStatus(UUID id, EntityStatus status) {
        Attachment attachment = getAttachmentEntity(id);
        validateResponsibleProfessor(attachment.getLesson().getModule().getDiscipline());
        attachment.setStatus(status);
        attachmentRepository.save(attachment);
    }

    @Transactional
    public void delete(UUID id) {
        changeStatus(id, EntityStatus.Inactive);
    }

    private void validateReadAccess(Lesson lesson) {
        if (lesson == null || lesson.getModule() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aula sem módulo associado");
        }

        Module module = lesson.getModule();
        UUID disciplineId = module.getDiscipline().getId();

        enrollmentService.validateContentAccessForCurrentUser(disciplineId);
        progressService.validateSequentialAccessForCurrentUser(module.getId());
    }

    private void validateResponsibleProfessor(Discipline discipline) {
        User authenticatedUser = findAuthenticatedUser();

        if (authenticatedUser.getRole() == UserRole.Admin) {
            return;
        }

        User responsibleProfessor = discipline.getResponsibleProfessor();

        if (responsibleProfessor == null || !responsibleProfessor.getId().equals(authenticatedUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Professor nao autorizado para esta disciplina");
        }
    }

    private void validateLessonActive(Lesson lesson) {
        if (lesson.getStatus() != EntityStatus.Active) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Não é possível adicionar materiais a uma aula inativa");
        }
    }

    private void validateFileUrl(AttachmentType type, String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A URL do material é obrigatória");
        }

        String trimmed = fileUrl.trim();

        switch (type) {
            case VIDEO -> {
                if (!YouTubeUrlValidator.isValidYouTubeUrl(trimmed)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Vídeos devem usar uma URL válida do YouTube");
                }
            }
            case IMAGE -> {
                if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Imagens devem usar uma URL http ou https");
                }
            }
            case DOCUMENT -> validateGenericUrl(trimmed);
        }
    }

    private void validateGenericUrl(String url) {
        try {
            URI.create(url);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL inválida");
        }
    }

    private Lesson getLessonEntity(UUID id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aula não encontrada"));
    }

    private Attachment getAttachmentEntity(UUID id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material não encontrado"));
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
