
package com.ufpa.SAGUI.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Enrollment;

import java.util.Optional;
import com.ufpa.SAGUI.enums.EnrollmentStatus;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    
    
    boolean existsByStudent_IdAndDiscipline_IdAndStatusNot(UUID studentId, UUID disciplineId, EntityStatus status);
    
    boolean existsByStudent_IdAndDiscipline_IdAndEnrollmentStatus(UUID studentId, UUID disciplineId, com.ufpa.SAGUI.enums.EnrollmentStatus enrollmentStatus);
   
    Optional<Enrollment> findByStudent_IdAndDiscipline_IdAndEnrollmentStatus(
        UUID studentId, UUID disciplineId, EnrollmentStatus status);

    
}
