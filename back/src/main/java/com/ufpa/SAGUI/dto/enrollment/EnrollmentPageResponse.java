package com.ufpa.SAGUI.dto.enrollment;

import java.util.List;

import org.springframework.data.domain.Page;

import com.ufpa.SAGUI.models.enrollment.Enrollment;

public record EnrollmentPageResponse(
        List<EnrollmentDetailResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last) {

    public static EnrollmentPageResponse from(Page<Enrollment> page) {
        return new EnrollmentPageResponse(
                page.getContent().stream().map(EnrollmentDetailResponse::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
