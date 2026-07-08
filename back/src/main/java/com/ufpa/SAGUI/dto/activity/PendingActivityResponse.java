package com.ufpa.SAGUI.dto.activity;

import java.util.UUID;

public record PendingActivityResponse(
        UUID studentId,
        String studentName,
        UUID activityId,
        String activityTitle,
        UUID moduleId,
        String moduleName,
        Integer attemptsUsed,
        Integer attemptLimit,
        Double bestScore
) {
}
