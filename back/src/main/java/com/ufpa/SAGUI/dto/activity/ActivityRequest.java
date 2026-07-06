package com.ufpa.SAGUI.dto.activity;

import java.util.List;

public record ActivityRequest(
        String title,
        String description,
        List<QuestionRequest> questions
) {
}
