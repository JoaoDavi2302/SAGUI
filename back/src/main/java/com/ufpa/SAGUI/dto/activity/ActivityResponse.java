package com.ufpa.SAGUI.dto.activity;

import java.util.List;
import java.util.UUID;

import com.ufpa.SAGUI.enums.EntityStatus;

public record ActivityResponse(
        UUID id,
        UUID moduleId,
        String title,
        String description,
        Integer attemptLimit,
        Double minimumScore,
        EntityStatus status,
        List<QuestionResponse> questions
) {
}
