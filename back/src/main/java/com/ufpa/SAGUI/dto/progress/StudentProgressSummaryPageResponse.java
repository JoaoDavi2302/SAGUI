package com.ufpa.SAGUI.dto.progress;

import java.util.List;

import org.springframework.data.domain.Page;

public record StudentProgressSummaryPageResponse(
        List<StudentProgressSummaryResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static StudentProgressSummaryPageResponse from(
            Page<?> page,
            List<StudentProgressSummaryResponse> content
    ) {
        return new StudentProgressSummaryPageResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
