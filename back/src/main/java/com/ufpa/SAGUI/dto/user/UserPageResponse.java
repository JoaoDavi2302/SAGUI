package com.ufpa.SAGUI.dto.user;

import java.util.List;

import org.springframework.data.domain.Page;

import com.ufpa.SAGUI.models.user.User;

public record UserPageResponse(
    List<UserProfileResponse> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last
) {
    public static UserPageResponse from(Page<User> page) {
        return new UserPageResponse(
            page.getContent().stream().map(UserProfileResponse::from).toList(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }
}
