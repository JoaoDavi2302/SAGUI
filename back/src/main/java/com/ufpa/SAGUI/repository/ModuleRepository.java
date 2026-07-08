package com.ufpa.SAGUI.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Module;

import java.util.List;
import java.util.Optional;


public interface ModuleRepository extends JpaRepository<Module, UUID> {
    Page<Module> findAllByDiscipline_Id(UUID disciplineId, Pageable pageable);
    Page<Module> findAllByStatus(EntityStatus status, Pageable pageable);
    Page<Module> findAllByDiscipline_IdAndStatus(UUID disciplineId, EntityStatus status, Pageable pageable);

    List<Module> findByDiscipline_IdOrderByOrderIndexAsc(UUID disciplineId);

    List<Module> findByDiscipline_IdAndStatusOrderByOrderIndexAsc(
            UUID disciplineId, EntityStatus status);

    Optional<Module> findFirstByDiscipline_IdAndOrderIndexLessThanOrderByOrderIndexDesc(
            UUID disciplineId, Integer orderIndex);

    Optional<Module> findFirstByDiscipline_IdAndStatusAndOrderIndexLessThanOrderByOrderIndexDesc(
            UUID disciplineId, EntityStatus status, Integer orderIndex);
}
