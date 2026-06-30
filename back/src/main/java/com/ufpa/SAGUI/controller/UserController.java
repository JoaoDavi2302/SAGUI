package com.ufpa.SAGUI.controller;

import java.util.UUID;

import org.springframework.data.domain.Pageable;

import org.springframework.data.web.PageableDefault;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.user.UpdateProfileRequest;
import com.ufpa.SAGUI.dto.user.UserPageResponse;
import com.ufpa.SAGUI.dto.user.UserProfileResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Usuários", description = "Gestão e perfil de usuários")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<UserPageResponse> listUsers(
        @RequestParam(required = false) UserRole role,
        @RequestParam(required = false) EntityStatus status,
        @RequestParam(required = false) String search,
        @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(userService.listUsers(role, status, search, pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateMyProfile( @RequestBody @Valid UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(request));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<UserProfileResponse> activateUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<UserProfileResponse> deactivateUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<UserProfileResponse> changeRole(@PathVariable UUID id, @RequestParam UserRole role){
        return ResponseEntity.ok(userService.changeRole(id, role));
    }
}

