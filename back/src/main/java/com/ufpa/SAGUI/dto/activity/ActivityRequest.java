package com.ufpa.SAGUI.dto.activity;

import java.util.List;
import java.util.UUID;

public record ActivityRequest(
        UUID moduleId,
        String title,
        String description,
        List<QuestionRequest> questions
) {
}
