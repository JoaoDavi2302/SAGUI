package com.ufpa.SAGUI.repository;

import com.ufpa.SAGUI.models.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
}
