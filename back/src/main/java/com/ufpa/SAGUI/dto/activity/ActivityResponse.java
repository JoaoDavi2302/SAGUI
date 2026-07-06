package com.ufpa.SAGUI.dto.activity;

import java.util.List;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        UUID moduleId,
        String title,
        String description,
        Integer attemptLimit,
        Double minimumScore,
        List<QuestionResponse> questions
) {
}
