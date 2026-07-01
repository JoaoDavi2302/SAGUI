package com.ufpa.SAGUI.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ufpa.SAGUI.dto.enrollment.EnrollmentRequest;
import com.ufpa.SAGUI.dto.enrollment.EnrollmentResponse;
import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.enums.EntityStatus;
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
                .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));
        
        Discipline discipline = disciplineRepository.findById(request.getDisciplineId())
                .orElseThrow(() -> new RuntimeException("Disciplina não encontrada"));

    
        
        boolean alreadyEnrolled = enrollmentRepository.existsByStudent_IdAndDiscipline_IdAndStatusNot(
                student.getId(), discipline.getId(), EntityStatus.Inactive);
        
        if (alreadyEnrolled) {
        	throw new IllegalArgumentException("Erro de Validação: O aluno já possui uma matrícula ativa ou pendente nesta disciplina.");
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
    public EnrollmentResponse approveEnrollment(java.util.UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Matrícula não encontrada com o ID: " + enrollmentId));

        if (enrollment.getEnrollmentStatus() != EnrollmentStatus.PENDING) {
            throw new RuntimeException("Apenas matrículas PENDENTES podem ser aprovadas.");
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
    public boolean isStudentEnrolledInDiscipline(java.util.UUID studentId, java.util.UUID disciplineId) {
        return enrollmentRepository.findById(studentId).isPresent(); // Vamos ajustar a busca real abaixo
    }
    
    @Transactional(readOnly = true)
    public void validateContentAccess(java.util.UUID studentId, java.util.UUID disciplineId) {
        boolean hasAccess = enrollmentRepository.existsByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
                studentId, disciplineId, EnrollmentStatus.APPROVED);

        if (!hasAccess) {
            throw new RuntimeException("Acesso negado: O aluno não possui uma matrícula aprovada nesta disciplina.");
        }
    }
}
