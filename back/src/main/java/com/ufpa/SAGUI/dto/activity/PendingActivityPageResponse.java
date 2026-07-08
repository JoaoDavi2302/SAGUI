package com.ufpa.SAGUI.dto.activity;

import java.util.List;

import org.springframework.data.domain.Page;

public record PendingActivityPageResponse(
        List<PendingActivityResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static PendingActivityPageResponse from(Page<?> page, List<PendingActivityResponse> content) {
        return new PendingActivityPageResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
