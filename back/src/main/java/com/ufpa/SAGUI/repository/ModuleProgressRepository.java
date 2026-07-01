package com.ufpa.SAGUI.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.models.ModuleProgress;

public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, UUID> {
    
    
    
}
