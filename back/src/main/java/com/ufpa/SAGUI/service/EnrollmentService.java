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

        )
        
        boolean alreadyEnrolled = enrollmentRepository.existsByStudent_IdAndDiscipline_IdAndStatusNot(
                student.getId(), discipline.getId(), EntityStatus.Inactive);
        
        if (alreadyEnrolled) {
            throw new RuntimeException("Aluno já possui matrícula ativa ou pendente nesta disciplina!");
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
}
