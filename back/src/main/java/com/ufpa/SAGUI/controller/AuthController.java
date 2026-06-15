package com.ufpa.SAGUI.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ufpa.SAGUI.dto.auth.LoginRequest;
import com.ufpa.SAGUI.dto.auth.LoginResponse;
import com.ufpa.SAGUI.dto.auth.RegisterRequest;
import com.ufpa.SAGUI.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request){
        return authService.login(request);
    }

    @PostMapping("/register")
    public LoginResponse register(@RequestBody RegisterRequest request){
        return authService.register(request);
    }
}
