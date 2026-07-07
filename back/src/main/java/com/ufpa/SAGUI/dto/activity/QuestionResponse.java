package com.ufpa.SAGUI.dto.activity;

import com.ufpa.SAGUI.enums.QuestionType;

import java.util.List;
import java.util.UUID;

public record QuestionResponse(
        UUID id,
        String statement,
        QuestionType questionType,
        Double score,
        List<AlternativeResponse> alternatives
) {
}
