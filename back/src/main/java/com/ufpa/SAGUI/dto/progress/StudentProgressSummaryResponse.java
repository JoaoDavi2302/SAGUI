package com.ufpa.SAGUI.dto.progress;

import java.util.UUID;

public record StudentProgressSummaryResponse(
        UUID studentId,
        String studentName,
        String studentEmail,
        Integer overallPercentage,
        Integer completedModules,
        Integer totalModules
) {
}
