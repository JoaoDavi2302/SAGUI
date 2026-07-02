package com.ufpa.SAGUI.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.lesson.LessonResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.repository.LessonRepository;
import com.ufpa.SAGUI.repository.ModuleRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;

    @Transactional(readOnly = true)
    public Page<LessonResponse> findByModule(UUID moduleId, EntityStatus status, Pageable pageable) {
        ensureModuleExists(moduleId);

        if (status != null) {
            return lessonRepository.findAllByModule_IdAndStatus(moduleId, status, pageable)
                    .map(LessonResponse::from);
        }

        return lessonRepository.findAllByModule_Id(moduleId, pageable).map(LessonResponse::from);
    }

    public LessonResponse createLesson(LessonRequest dto) {
        Module module = getModuleEntity(dto.moduleId());
        validateResponsibleProfessor(module);

        Lesson lesson = Lesson.builder()
            .name(dto.name())
            .description(dto.description())
            .orderIndex(dto.orderIndex())
            .module(module)
            .build();

        lesson.setStatus(EntityStatus.Active);
        return LessonResponse.from(lessonRepository.save(lesson));
    }

    public LessonResponse updateLesson(UUID id, LessonRequest dto) {
        Lesson lesson = getLessonEntity(id);
        validateResponsibleProfessor(lesson.getModule());

        Module module = getModuleEntity(dto.moduleId());
        validateResponsibleProfessor(module);

        lesson.setName(dto.name());
        lesson.setDescription(dto.description());
        lesson.setOrderIndex(dto.orderIndex());
        lesson.setModule(module);
        return LessonResponse.from(lessonRepository.save(lesson));
    }

    public void changeStatus(UUID id, EntityStatus status) {
        Lesson lesson = getLessonEntity(id);
        lesson.setStatus(status);
        lessonRepository.save(lesson);
    }

    private void ensureModuleExists(UUID moduleId) {
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Modulo nao encontrado");
        }
    }
}
