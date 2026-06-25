package com.ufpa.SAGUI.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.discipline.DisciplineRequest;
import com.ufpa.SAGUI.dto.discipline.DisciplineResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.Course;
import com.ufpa.SAGUI.models.Discipline;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.CourseRepository;
import com.ufpa.SAGUI.repository.DisciplineRepository;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class DisciplineService {

    private final DisciplineRepository disciplineRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public DisciplineResponse create(DisciplineRequest dto) {
        Course course = courseRepository.findById(dto.courseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));

        User professor = userRepository.findById(dto.responsibleProfessorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor não encontrado"));

        if (professor.getRole() != UserRole.Professor) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O usuário selecionado não é um professor");
        }

        Discipline discipline = Discipline.builder()
                .name(dto.name())
                .description(dto.description())
                .course(course)
                .responsibleProfessor(professor)
                .build();
        discipline.setStatus(EntityStatus.Active);

        return DisciplineResponse.from(disciplineRepository.save(discipline));
    }

    public DisciplineResponse update(UUID id, DisciplineRequest dto) {
        Discipline discipline = getDisciplineEntity(id);

        Course course = courseRepository.findById(dto.courseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));

        User professor = userRepository.findById(dto.responsibleProfessorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor não encontrado"));

        if (professor.getRole() != UserRole.Professor) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O usuário selecionado não é um professor");
        }

        discipline.setName(dto.name());
        discipline.setDescription(dto.description());
        discipline.setCourse(course);
        discipline.setResponsibleProfessor(professor);

        return DisciplineResponse.from(disciplineRepository.save(discipline));
    }

    public void changeStatus(UUID id, EntityStatus status) {
        Discipline discipline = getDisciplineEntity(id);
        discipline.setStatus(status);
        disciplineRepository.save(discipline);
    }

    @Transactional(readOnly = true)
    public Page<DisciplineResponse> findAll(UUID courseId, Pageable pageable) {
        if (courseId != null) {
            return disciplineRepository.findAllByCourse_Id(courseId, pageable).map(DisciplineResponse::from);
        }
        return disciplineRepository.findAll(pageable).map(DisciplineResponse::from);
    }

    private Discipline getDisciplineEntity(UUID id) {
        return disciplineRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina não encontrada"));
    }

    @Transactional(readOnly = true)
    public DisciplineResponse findById(UUID id) {
        return DisciplineResponse.from(getDisciplineEntity(id));
    }
}


