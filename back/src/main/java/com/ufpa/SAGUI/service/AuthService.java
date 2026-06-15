package com.ufpa.SAGUI.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ufpa.SAGUI.auth.JwtService;
import com.ufpa.SAGUI.dto.auth.LoginRequest;
import com.ufpa.SAGUI.dto.auth.LoginResponse;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.UserRepository;
import com.ufpa.SAGUI.dto.auth.RegisterRequest;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.email()).orElseThrow(
            () -> new BadCredentialsException("Credenciais inválidas")
        );

        if(!passwordEncoder.matches(request.password(), user.getPassword())){
            throw new BadCredentialsException("Credenciais inválidas");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(token);
    }

    public LoginResponse register(RegisterRequest request){
        if(userRepository.findByEmail(request.email()).isPresent()){
            throw new BadCredentialsException("Usuario cadastrado já existe");
        }

        User user = User.builder()
            .name(request.name())
            .email(request.email())
            .passwordHash(
                passwordEncoder.encode(request.password())
            )
            .role(UserRole.Aluno)
            .build();

        User savedUser = userRepository.save(user);;

        String token = jwtService.generateToken(savedUser);

        return new LoginResponse(token);
    }
}
