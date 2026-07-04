package com.ufpa.SAGUI.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    boolean existsByStudent_IdAndDiscipline_IdAndStatusNot(UUID studentId, UUID disciplineId, EntityStatus status);

    boolean existsByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
            UUID studentId, UUID disciplineId, EnrollmentStatus enrollmentStatus);

    Optional<Enrollment> findByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
            UUID studentId, UUID disciplineId, EnrollmentStatus status);

    Page<Enrollment> findByEnrollmentStatusAndStatus(
            EnrollmentStatus enrollmentStatus, EntityStatus status, Pageable pageable);

    Page<Enrollment> findByStudent_IdAndStatus(UUID studentId, EntityStatus status, Pageable pageable);

    Optional<Enrollment> findByIdAndStudent_IdAndStatus(UUID id, UUID studentId, EntityStatus status);
}
