package com.ufpa.SAGUI.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ufpa.SAGUI.dto.user.UpdateProfileRequest;
import com.ufpa.SAGUI.dto.user.UserPageResponse;
import com.ufpa.SAGUI.dto.user.UserProfileResponse;
import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.RefreshTokenRepository;
import com.ufpa.SAGUI.repository.UserRepository;
import com.ufpa.SAGUI.repository.UserSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }

    @Transactional(readOnly = true)
    public UserPageResponse listUsers(UserRole role, EntityStatus status, String search, Pageable pageable) {
        Page<User> page = userRepository.findAll(
            UserSpecifications.withFilters(role, status, search),
            pageable
        );
        return UserPageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile() {
        return UserProfileResponse.from(findAuthenticatedUser());
    }

    @Transactional
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        User user = findAuthenticatedUser();

        if (request.name() != null) {
            user.setName(request.name());
        }

        if (request.birthDate() != null) {
            user.setBirthDate(request.birthDate());
        }

        if (request.address() != null) {
            user.setAddress(request.address());
        }

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            userRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já está em uso");
                });
            user.setEmail(request.email());
        }

        boolean changingPassword = request.newPassword() != null && !request.newPassword().isBlank();
        if (changingPassword) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new BadCredentialsException("Senha atual é obrigatória para alterar a senha");
            }
            if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                throw new BadCredentialsException("Senha atual incorreta");
            }
            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }

        User savedUser = userRepository.save(user);
        return UserProfileResponse.from(savedUser);
    }

    @Transactional
    public UserProfileResponse activateUser(UUID userId) {
        User user = findUserById(userId);
        user.setStatus(EntityStatus.Active);
        return UserProfileResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse deactivateUser(UUID userId) {
        User current = findAuthenticatedUser();
        User user = findUserById(userId);

        if (user.getId().equals(current.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível inativar a própria conta");
        }

        user.setStatus(EntityStatus.Inactive);
        refreshTokenRepository.deleteByUser(user);
        return UserProfileResponse.from(userRepository.save(user));
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private User findAuthenticatedUser() {
        return userRepository.findByEmail(getAuthenticatedEmail())
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }

    private String getAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Usuário não autenticado");
        }

        return authentication.getName();
    }
}
