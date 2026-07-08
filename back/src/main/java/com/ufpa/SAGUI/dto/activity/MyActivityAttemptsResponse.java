package com.ufpa.SAGUI.dto.activity;

import java.util.List;
import java.util.UUID;

public record MyActivityAttemptsResponse(
        UUID activityId,
        String activityTitle,
        Integer attemptLimit,
        Double minimumScore,
        Integer attemptsUsed,
        Integer attemptsRemaining,
        Double bestScore,
        Boolean hasApprovedAttempt,
        List<StudentOwnAttemptResponse> attempts
) {
}
