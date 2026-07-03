package com.ufpa.SAGUI.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.models.ModuleProgress;

import java.util.List;
import java.util.Optional;

public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, UUID> {
    
    Optional<ModuleProgress> findByEnrollment_IdAndModule_Id(UUID enrollmentId, UUID moduleId);

List<ModuleProgress> findByEnrollment_Id(UUID enrollmentId);
    
}
