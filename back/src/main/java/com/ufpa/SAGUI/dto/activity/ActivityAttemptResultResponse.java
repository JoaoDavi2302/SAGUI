package com.ufpa.SAGUI.dto.activity;

import java.util.UUID;

public record ActivityAttemptResultResponse(
        UUID attemptId,
        Integer attemptNumber,
        Double score,
        Boolean approved,
        String message
) {
}
