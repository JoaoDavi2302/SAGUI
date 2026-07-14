package com.ufpa.SAGUI.dto.activity;

import java.util.List;
import java.util.UUID;

import com.ufpa.SAGUI.models.activity.Alternative;
import com.ufpa.SAGUI.models.activity.StudentAnswer;

public record StudentAnswerDetailResponse(
        UUID questionId,
        String statement,
        List<AlternativeResponse> selectedAlternatives,
        List<AlternativeResponse> correctAlternatives,
        Boolean correct,
        Double questionScore
) {

    public static StudentAnswerDetailResponse from(StudentAnswer answer) {
        List<AlternativeResponse> selected = answer.getSelectedAlternatives()
                .stream()
                .map(StudentAnswerDetailResponse::toAlternativeResponse)
                .toList();

        List<AlternativeResponse> correct = answer.getQuestion().getAlternatives()
                .stream()
                .filter(Alternative::getCorrect)
                .map(StudentAnswerDetailResponse::toAlternativeResponse)
                .toList();

        return new StudentAnswerDetailResponse(
                answer.getQuestion().getId(),
                answer.getQuestion().getStatement(),
                selected,
                correct,
                answer.getCorrect(),
                answer.getQuestion().getScore());
    }

    private static AlternativeResponse toAlternativeResponse(Alternative alternative) {
        return new AlternativeResponse(
                alternative.getId(),
                alternative.getText(),
                alternative.getCorrect());
    }
}
