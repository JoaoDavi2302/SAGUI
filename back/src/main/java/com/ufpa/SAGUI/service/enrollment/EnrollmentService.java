package com.ufpa.SAGUI.service.enrollment;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.enrollment.EnrollmentPageResponse;
import com.ufpa.SAGUI.dto.enrollment.EnrollmentRequest;
import com.ufpa.SAGUI.dto.enrollment.EnrollmentResponse;
import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.course.Course;
import com.ufpa.SAGUI.models.discipline.Discipline;
import com.ufpa.SAGUI.models.enrollment.Enrollment;
import com.ufpa.SAGUI.models.user.User;
import com.ufpa.SAGUI.repository.course.CourseRepository;
import com.ufpa.SAGUI.repository.discipline.DisciplineRepository;
import com.ufpa.SAGUI.repository.enrollment.EnrollmentRepository;
import com.ufpa.SAGUI.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final DisciplineRepository disciplineRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public EnrollmentResponse requestEnrollment(EnrollmentRequest request) {
        User student = findAuthenticatedUser();

        Discipline discipline = disciplineRepository.findById(request.getDisciplineId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina não encontrada"));

        if (discipline.getStatus() != EntityStatus.Active) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Disciplina inativa não aceita matrículas");
        }

        boolean alreadyEnrolled = enrollmentRepository
                .existsByStudent_IdAndDiscipline_IdAndEnrollmentStatusInAndStatus(
                        student.getId(),
                        discipline.getId(),
                        List.of(EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED),
                        EntityStatus.Active);

        if (alreadyEnrolled) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "O aluno já possui uma matrícula pendente ou aprovada nesta disciplina.");
        }

        Enrollment.EnrollmentBuilder enrollmentBuilder = Enrollment.builder()
                .student(student)
                .discipline(discipline)
                .enrollmentStatus(EnrollmentStatus.PENDING);

        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso não encontrado"));
            if (discipline.getCourse() == null
                    || !course.getId().equals(discipline.getCourse().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "O curso informado não pertence a esta disciplina");
            }
            enrollmentBuilder.course(course);
        } else if (discipline.getCourse() != null) {
            enrollmentBuilder.course(discipline.getCourse());
        }

        Enrollment enrollment = enrollmentBuilder.build();
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
        return updateEnrollmentStatus(enrollmentId, EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED,
                "Matrícula aprovada com sucesso!");
    }

    @Transactional
    public EnrollmentResponse rejectEnrollment(UUID enrollmentId) {
        return updateEnrollmentStatus(enrollmentId, EnrollmentStatus.PENDING, EnrollmentStatus.REJECTED,
                "Matrícula rejeitada com sucesso!");
    }

    @Transactional
    public EnrollmentResponse cancelEnrollment(UUID enrollmentId) {
        User student = findAuthenticatedUser();

        Enrollment enrollment = enrollmentRepository
                .findByIdAndStudent_IdAndStatus(enrollmentId, student.getId(), EntityStatus.Active)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Matrícula não encontrada com o ID: " + enrollmentId));

        if (enrollment.getEnrollmentStatus() != EnrollmentStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Apenas matrículas PENDENTES podem ser canceladas.");
        }

        enrollment.setEnrollmentStatus(EnrollmentStatus.CANCELLED);
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return EnrollmentResponse.builder()
                .id(savedEnrollment.getId())
                .status(savedEnrollment.getEnrollmentStatus())
                .message("Matrícula cancelada com sucesso!")
                .build();
    }

    @Transactional(readOnly = true)
    public EnrollmentPageResponse listPendingEnrollments(Pageable pageable) {
        return EnrollmentPageResponse.from(
                enrollmentRepository.findByEnrollmentStatusAndStatus(
                        EnrollmentStatus.PENDING, EntityStatus.Active, pageable));
    }

    @Transactional(readOnly = true)
    public EnrollmentPageResponse listMyEnrollments(Pageable pageable) {
        User student = findAuthenticatedUser();
        return EnrollmentPageResponse.from(
                enrollmentRepository.findByStudent_IdAndStatus(student.getId(), EntityStatus.Active, pageable));
    }

    @Transactional(readOnly = true)
    public EnrollmentPageResponse listByDiscipline(UUID disciplineId, Pageable pageable) {
        Discipline discipline = disciplineRepository.findById(disciplineId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina não encontrada"));

        User user = findAuthenticatedUser();

        if (user.getRole() == UserRole.Professor) {
            User responsibleProfessor = discipline.getResponsibleProfessor();
            if (responsibleProfessor == null
                    || !responsibleProfessor.getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Professor não autorizado para esta disciplina");
            }
        } else if (user.getRole() != UserRole.Admin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        return EnrollmentPageResponse.from(
                enrollmentRepository.findByDiscipline_IdAndEnrollmentStatusAndStatus(
                        disciplineId, EnrollmentStatus.APPROVED, EntityStatus.Active, pageable));
    }

    private EnrollmentResponse updateEnrollmentStatus(
            UUID enrollmentId,
            EnrollmentStatus expectedStatus,
            EnrollmentStatus newStatus,
            String successMessage) {

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Matrícula não encontrada com o ID: " + enrollmentId));

        if (enrollment.getEnrollmentStatus() != expectedStatus) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Apenas matrículas PENDENTES podem ser " + actionLabel(newStatus) + ".");
        }

        enrollment.setEnrollmentStatus(newStatus);
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return EnrollmentResponse.builder()
                .id(savedEnrollment.getId())
                .status(savedEnrollment.getEnrollmentStatus())
                .message(successMessage)
                .build();
    }

    private String actionLabel(EnrollmentStatus newStatus) {
        return switch (newStatus) {
            case APPROVED -> "aprovadas";
            case REJECTED -> "rejeitadas";
            default -> "alteradas";
        };
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Usuário autenticado não encontrado"));
    }
}
