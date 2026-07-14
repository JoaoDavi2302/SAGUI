package com.ufpa.SAGUI.dto.enrollment;

import java.util.UUID;

import com.ufpa.SAGUI.enums.EnrollmentStatus;
import com.ufpa.SAGUI.models.enrollment.Enrollment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnrollmentDetailResponse {

    private UUID id;
    private EnrollmentStatus status;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private UUID disciplineId;
    private String disciplineName;
    private UUID courseId;

    public static EnrollmentDetailResponse from(Enrollment enrollment) {
        return EnrollmentDetailResponse.builder()
                .id(enrollment.getId())
                .status(enrollment.getEnrollmentStatus())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getName())
                .studentEmail(enrollment.getStudent().getEmail())
                .disciplineId(enrollment.getDiscipline() != null ? enrollment.getDiscipline().getId() : null)
                .disciplineName(enrollment.getDiscipline() != null ? enrollment.getDiscipline().getName() : null)
                .courseId(enrollment.getCourse() != null ? enrollment.getCourse().getId() : null)
                .build();
    }
}
