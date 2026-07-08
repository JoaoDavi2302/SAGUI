package com.ufpa.SAGUI.dto.activity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.ufpa.SAGUI.enums.AttemptStatus;
import com.ufpa.SAGUI.models.ActivityAttempt;

public record ActivityAttemptDetailResponse(
        UUID attemptId,
        UUID activityId,
        String activityTitle,
        Double minimumScore,
        UUID studentId,
        String studentName,
        Integer attemptNumber,
        Double score,
        Boolean approved,
        AttemptStatus status,
        LocalDateTime submittedAt,
        List<StudentAnswerDetailResponse> answers
) {

    public static ActivityAttemptDetailResponse from(ActivityAttempt attempt) {
        List<StudentAnswerDetailResponse> answers = attempt.getAnswers()
                .stream()
                .map(StudentAnswerDetailResponse::from)
                .toList();

        return new ActivityAttemptDetailResponse(
                attempt.getId(),
                attempt.getActivity().getId(),
                attempt.getActivity().getTitle(),
                attempt.getActivity().getMinimumScore(),
                attempt.getStudent().getId(),
                attempt.getStudent().getName(),
                attempt.getAttemptNumber(),
                attempt.getScore(),
                attempt.getApproved(),
                attempt.getAttemptStatus(),
                attempt.getCreatedATt(),
                answers);
    }
}
