package com.ufpa.SAGUI.repository;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.models.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    List<Activity> findAllByStatus(EntityStatus status);

    List<Activity> findAllByModule_IdAndStatus(UUID moduleId, EntityStatus status);

    Optional<Activity> findByIdAndStatus(UUID id, EntityStatus status);

    long countByModule_IdAndStatus(UUID moduleId, EntityStatus status);
}
