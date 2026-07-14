package com.ufpa.SAGUI.dto.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.user.User;

public record UserProfileResponse(
    UUID id,
    String name,
    String email,
    UserRole role,
    EntityStatus status,
    LocalDate birthDate,
    String address,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getStatus(),
            user.getBirthDate(),
            user.getAddress(),
            user.getCreatedATt(),
            user.getUpdatedAt()
        );
    }
}
