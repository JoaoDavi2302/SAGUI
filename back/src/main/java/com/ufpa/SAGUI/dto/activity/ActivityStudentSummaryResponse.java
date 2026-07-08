package com.ufpa.SAGUI.dto.activity;

import java.util.UUID;

import com.ufpa.SAGUI.enums.EntityStatus;

public record ActivityStudentSummaryResponse(
        UUID id,
        UUID moduleId,
        String title,
        String description,
        Integer attemptLimit,
        Double minimumScore,
        EntityStatus status,
        Integer attemptsUsed,
        Integer attemptsRemaining,
        Double bestScore,
        Boolean hasApprovedAttempt
) {
}
