package com.ufpa.SAGUI.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String token);
    Page<User> findAllByRole(UserRole role, Pageable pg);
    Page<User> findAllByStatus(EntityStatus status, Pageable pg);


}
