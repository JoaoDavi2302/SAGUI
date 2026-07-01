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

    private void ensureModuleExists(UUID moduleId) {
        if (!moduleRepository.existsById(moduleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Modulo nao encontrado");
        }
    }
}
