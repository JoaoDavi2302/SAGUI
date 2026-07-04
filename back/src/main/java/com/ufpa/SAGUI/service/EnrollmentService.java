package com.ufpa.SAGUI.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.enrollment.EnrollmentRequest;
import com.ufpa.SAGUI.dto.enrollment.EnrollmentResponse;
import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.Discipline;
import com.ufpa.SAGUI.models.Enrollment;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.DisciplineRepository;
import com.ufpa.SAGUI.repository.EnrollmentRepository;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor 
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository; 
    private final DisciplineRepository disciplineRepository; 

    @Transactional
    public EnrollmentResponse requestEnrollment(EnrollmentRequest request) {
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado"));
        
        Discipline discipline = disciplineRepository.findById(request.getDisciplineId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina não encontrada"));

        boolean alreadyEnrolled = enrollmentRepository.existsByStudent_IdAndDiscipline_IdAndStatusNot(
                student.getId(), discipline.getId(), EntityStatus.Inactive);
        
        if (alreadyEnrolled) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "O aluno já possui uma matrícula ativa ou pendente nesta disciplina.");
        }
      
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .discipline(discipline)
                .enrollmentStatus(EnrollmentStatus.PENDING) 
                .build();
               
        enrollment.setStatus(EntityStatus.Active);
        
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return EnrollmentResponse.builder()
                .id(savedEnrollment.getId()) 
                .status(savedEnrollment.getEnrollmentStatus()) 
                .message("Solicitação de matrícula enviada com sucesso!")
                .build();
    }
    
    @Transactional
    public EnrollmentResponse approveEnrollment(UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Matrícula não encontrada com o ID: " + enrollmentId));

        if (enrollment.getEnrollmentStatus() != EnrollmentStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Apenas matrículas PENDENTES podem ser aprovadas.");
        }

        enrollment.setEnrollmentStatus(EnrollmentStatus.APPROVED);

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return EnrollmentResponse.builder()
                .id(savedEnrollment.getId())
                .status(savedEnrollment.getEnrollmentStatus())
                .message("Matrícula aprovada com sucesso!")
                .build();
    }
    
    @Transactional(readOnly = true)
    public boolean isStudentEnrolledInDiscipline(UUID studentId, UUID disciplineId) {
        return enrollmentRepository.existsByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
                studentId, disciplineId, EnrollmentStatus.APPROVED);
    }
    
    @Transactional(readOnly = true)
    public void validateContentAccess(UUID studentId, UUID disciplineId) {
        boolean hasAccess = enrollmentRepository.existsByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
                studentId, disciplineId, EnrollmentStatus.APPROVED);

        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Acesso negado: o aluno não possui uma matrícula aprovada nesta disciplina.");
        }
    }

    @Transactional(readOnly = true)
    public void validateContentAccessForCurrentUser(UUID disciplineId) {
        User user = findAuthenticatedUser();

        if (user.getRole() == UserRole.Admin || user.getRole() == UserRole.Professor) {
            return;
        }

        validateContentAccess(user.getId(), disciplineId);
    }

    private User findAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário não autenticado");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário autenticado não encontrado"));
    }
}
