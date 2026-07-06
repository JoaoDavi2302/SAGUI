package com.ufpa.SAGUI.dto.activity;

import java.util.List;
import java.util.UUID;

public record StudentAnswerRequest(
        UUID questionId,
        List<UUID> selectedAlternativeIds
) {
}
