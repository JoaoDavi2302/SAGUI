package com.ufpa.SAGUI.repository;

import com.ufpa.SAGUI.models.ActivityAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityAttemptRepository extends JpaRepository<ActivityAttempt, UUID> {

    long countByStudentIdAndActivityId(UUID studentId, UUID activityId);

    List<ActivityAttempt> findByStudentIdAndActivityId(UUID studentId, UUID activityId);
}
