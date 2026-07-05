package com.ufpa.SAGUI.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.course.CourseRequest;
import com.ufpa.SAGUI.dto.course.CourseResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.Course;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.CourseRepository;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseResponse create(CourseRequest dto) {
        Course course = Course.builder()
                .name(dto.name())
                .description(dto.description())
                .build();
        course.setStatus(EntityStatus.Active);
        
        return CourseResponse.from(courseRepository.save(course));
    }

    public CourseResponse update(UUID id, CourseRequest dto) {
        Course course = getCourseEntity(id);
        course.setName(dto.name());
        course.setDescription(dto.description());
        
        return CourseResponse.from(courseRepository.save(course));
    }

    public void changeStatus(UUID id, EntityStatus status) {
        Course course = getCourseEntity(id);
        course.setStatus(status);
        courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> findAll(EntityStatus status, Pageable pageable) {
        if (status != null) {
            return courseRepository.findAllByStatus(status, pageable).map(CourseResponse::from);
        }
        return courseRepository.findAll(pageable).map(CourseResponse::from);
    }

    @Transactional(readOnly = true)
    public CourseResponse findById(UUID id) {
        return CourseResponse.from(getCourseEntity(id));
    }

    private Course getCourseEntity(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
    }

    @Transactional
    public void addProfessor(UUID courseId, UUID profId) {
        Course course = getCourseEntity(courseId);
        User professor = userRepository.findById(profId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor não encontrado"));

        if (professor.getRole() != UserRole.Professor) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O usuário selecionado não é um professor");
        }

        if (!course.getProfessors().contains(professor)) {
            course.getProfessors().add(professor);
            courseRepository.save(course);
        }
    }

}


