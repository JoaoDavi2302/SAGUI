package com.ufpa.SAGUI.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.auth.LoginRequest;
import com.ufpa.SAGUI.dto.auth.LoginResponse;
import com.ufpa.SAGUI.dto.auth.RefreshTokenRequest;
import com.ufpa.SAGUI.dto.auth.RefreshTokenResponse;
import com.ufpa.SAGUI.dto.auth.RegisterRequest;
import com.ufpa.SAGUI.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Autenticação", description = "Login, registro, refresh e logout")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    
    @Operation(summary = "Login", description = "Autentica o usuário e retorna access token e refresh token")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Registro", description = "Cria uma nova conta e retorna tokens de autenticação")
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(summary = "Renovar token", description = "Gera um novo access token a partir do refresh token")
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Logout", description = "Invalida o refresh token informado")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody @Valid RefreshTokenRequest request){
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }
}
