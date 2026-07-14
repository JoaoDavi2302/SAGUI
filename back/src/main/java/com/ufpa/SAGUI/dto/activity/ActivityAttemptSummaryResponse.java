package com.ufpa.SAGUI.dto.activity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ufpa.SAGUI.enums.AttemptStatus;
import com.ufpa.SAGUI.models.activity.ActivityAttempt;

public record ActivityAttemptSummaryResponse(
        UUID attemptId,
        UUID studentId,
        String studentName,
        Integer attemptNumber,
        Double score,
        Boolean approved,
        AttemptStatus status,
        LocalDateTime submittedAt
) {

    public static ActivityAttemptSummaryResponse from(ActivityAttempt attempt) {
        return new ActivityAttemptSummaryResponse(
                attempt.getId(),
                attempt.getStudent().getId(),
                attempt.getStudent().getName(),
                attempt.getAttemptNumber(),
                attempt.getScore(),
                attempt.getApproved(),
                attempt.getAttemptStatus(),
                attempt.getCreatedATt());
    }
}
