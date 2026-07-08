package com.ufpa.SAGUI.dto.activity;

import java.util.List;
import java.util.UUID;

public record ActivityTakeResponse(
        UUID id,
        UUID moduleId,
        String title,
        String description,
        Integer attemptLimit,
        Double minimumScore,
        Integer attemptsUsed,
        Integer attemptsRemaining,
        Double bestScore,
        Boolean hasApprovedAttempt,
        List<QuestionTakeResponse> questions
) {
}
