package com.ufpa.SAGUI.dto.activity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ufpa.SAGUI.enums.AttemptStatus;

public record StudentOwnAttemptResponse(
        UUID attemptId,
        Integer attemptNumber,
        Double score,
        Boolean approved,
        AttemptStatus status,
        LocalDateTime submittedAt
) {
}
