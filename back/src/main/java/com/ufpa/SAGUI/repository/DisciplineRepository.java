package com.ufpa.SAGUI.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Discipline;

public interface DisciplineRepository extends JpaRepository<Discipline, UUID> {
    Page<Discipline> findAllByCourse_Id(UUID courseId, Pageable pageable);
    Page<Discipline> findAllByResponsibleProfessor_Id(UUID profId, Pageable pageable);
    Page<Discipline> findAllByStatus(EntityStatus status, Pageable pageable);
}
