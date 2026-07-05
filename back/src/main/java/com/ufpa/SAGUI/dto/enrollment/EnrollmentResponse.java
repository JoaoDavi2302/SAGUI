package com.ufpa.SAGUI.dto.enrollment;

import java.util.UUID;

import com.ufpa.SAGUI.enums.EnrollmentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnrollmentResponse {
    private UUID id; 
    private EnrollmentStatus status; 
    private String message; 
}
