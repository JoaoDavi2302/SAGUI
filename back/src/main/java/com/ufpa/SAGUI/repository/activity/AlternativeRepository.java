package com.ufpa.SAGUI.repository.activity;

import com.ufpa.SAGUI.models.activity.Alternative;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AlternativeRepository extends JpaRepository<Alternative, UUID> {
}
