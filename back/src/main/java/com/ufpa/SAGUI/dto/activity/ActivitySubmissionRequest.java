package com.ufpa.SAGUI.dto.activity;

import java.util.List;

public record ActivitySubmissionRequest(
        List<StudentAnswerRequest> answers
) {
}
