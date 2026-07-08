package com.ufpa.SAGUI.dto.activity;

import java.util.List;

import org.springframework.data.domain.Page;

import com.ufpa.SAGUI.models.ActivityAttempt;

public record ActivityAttemptPageResponse(
        List<ActivityAttemptSummaryResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static ActivityAttemptPageResponse from(Page<ActivityAttempt> page) {
        return new ActivityAttemptPageResponse(
                page.getContent().stream().map(ActivityAttemptSummaryResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
