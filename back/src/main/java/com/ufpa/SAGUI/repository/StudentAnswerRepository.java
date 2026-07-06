package com.ufpa.SAGUI.repository;

import com.ufpa.SAGUI.models.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, UUID> {
}
