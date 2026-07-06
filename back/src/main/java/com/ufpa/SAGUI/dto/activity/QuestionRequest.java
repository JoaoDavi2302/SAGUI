package com.ufpa.SAGUI.dto.activity;

import com.ufpa.SAGUI.enums.QuestionType;

import java.util.List;

public record QuestionRequest(
        String statement,
        QuestionType questionType,
        Double score,
        List<AlternativeRequest> alternatives
) {
}
