package com.ufpa.SAGUI.repository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    boolean existsByStudent_IdAndDiscipline_IdAndEnrollmentStatusInAndStatus(
            UUID studentId, UUID disciplineId, Collection<EnrollmentStatus> enrollmentStatuses, EntityStatus status);

    boolean existsByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
            UUID studentId, UUID disciplineId, EnrollmentStatus enrollmentStatus);

    Optional<Enrollment> findByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
            UUID studentId, UUID disciplineId, EnrollmentStatus status);

    Page<Enrollment> findByEnrollmentStatusAndStatus(
            EnrollmentStatus enrollmentStatus, EntityStatus status, Pageable pageable);

    Page<Enrollment> findByStudent_IdAndStatus(UUID studentId, EntityStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "student", "discipline" })
    Page<Enrollment> findByDiscipline_IdAndEnrollmentStatusAndStatus(
            UUID disciplineId, EnrollmentStatus enrollmentStatus, EntityStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "student", "discipline" })
    Optional<Enrollment> findWithStudentAndDisciplineById(UUID id);

    @Query("""
            SELECT e, a, m FROM Enrollment e
            JOIN Module m ON m.discipline.id = e.discipline.id
            JOIN Activity a ON a.module.id = m.id
            WHERE e.discipline.id = :disciplineId
            AND e.enrollmentStatus = com.ufpa.SAGUI.enums.EnrollmentStatus.APPROVED
            AND e.status = com.ufpa.SAGUI.enums.EntityStatus.Active
            AND a.status = com.ufpa.SAGUI.enums.EntityStatus.Active
            AND NOT EXISTS (
                SELECT 1 FROM ActivityAttempt att
                WHERE att.student.id = e.student.id
                AND att.activity.id = a.id
                AND att.approved = true
            )
            ORDER BY e.student.name ASC, m.orderIndex ASC, a.title ASC
            """)
    Page<Object[]> findPendingStudentActivities(
            @Param("disciplineId") UUID disciplineId,
            Pageable pageable);

    Optional<Enrollment> findByIdAndStudent_IdAndStatus(UUID id, UUID studentId, EntityStatus status);
}
