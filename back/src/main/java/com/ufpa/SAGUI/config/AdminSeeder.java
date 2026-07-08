package com.ufpa.SAGUI.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${SAGUI_ADMIN_EMAIL:admin@sagui.local}")
    private String adminEmail;

    @Value("${SAGUI_ADMIN_PASSWORD:Admin@123}")
    private String adminPassword;

    @Value("${SAGUI_ADMIN_NAME:Administrador}")
    private String adminName;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(UserRole.Admin)) {
            return;
        }

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(UserRole.Admin)
                .build();
        admin.setStatus(EntityStatus.Active);

        userRepository.save(admin);
        log.info("Admin inicial criado: {}", adminEmail);
    }
}
