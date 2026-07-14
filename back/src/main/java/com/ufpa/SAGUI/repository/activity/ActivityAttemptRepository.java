package com.ufpa.SAGUI.repository.activity;

import com.ufpa.SAGUI.models.activity.ActivityAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityAttemptRepository extends JpaRepository<ActivityAttempt, UUID> {

    long countByStudentIdAndActivityId(UUID studentId, UUID activityId);

    boolean existsByStudent_IdAndActivity_IdAndApprovedTrue(UUID studentId, UUID activityId);

    long countByActivityId(UUID activityId);

    List<ActivityAttempt> findByStudentIdAndActivityId(UUID studentId, UUID activityId);

    Optional<ActivityAttempt> findByIdAndActivity_Id(UUID id, UUID activityId);

    Optional<ActivityAttempt> findByIdAndActivity_IdAndStudent_Id(UUID id, UUID activityId, UUID studentId);

    @Query("""
            SELECT a FROM ActivityAttempt a
            WHERE a.activity.id = :activityId
            AND (:studentId IS NULL OR a.student.id = :studentId)
            AND (:approved IS NULL OR a.approved = :approved)
            ORDER BY a.createdATt DESC
            """)
    Page<ActivityAttempt> findByActivityWithFilters(
            @Param("activityId") UUID activityId,
            @Param("studentId") UUID studentId,
            @Param("approved") Boolean approved,
            Pageable pageable);

    @Query("""
            SELECT MAX(a.score) FROM ActivityAttempt a
            WHERE a.student.id = :studentId
            AND a.activity.id = :activityId
            """)
    Double findBestScoreByStudentIdAndActivityId(
            @Param("studentId") UUID studentId,
            @Param("activityId") UUID activityId);
}
