package com.ufpa.SAGUI.service;

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
import com.ufpa.SAGUI.dto.user.UserProfileResponse;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
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
