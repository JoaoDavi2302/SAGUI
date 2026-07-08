package com.ufpa.SAGUI.repository;

import com.ufpa.SAGUI.models.Alternative;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AlternativeRepository extends JpaRepository<Alternative, UUID> {
}
