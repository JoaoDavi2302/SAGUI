package com.ufpa.SAGUI.dto.activity;

import java.util.List;
import java.util.UUID;

import com.ufpa.SAGUI.enums.QuestionType;

public record QuestionTakeResponse(
        UUID id,
        String statement,
        QuestionType questionType,
        Double score,
        List<AlternativeTakeResponse> alternatives
) {
}
