package com.ufpa.SAGUI.repository;

import com.ufpa.SAGUI.models.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {
}
