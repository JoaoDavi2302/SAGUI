package com.ufpa.SAGUI.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ufpa.SAGUI.auth.JwtService;
import com.ufpa.SAGUI.dto.auth.LoginRequest;
import com.ufpa.SAGUI.dto.auth.LoginResponse;
import com.ufpa.SAGUI.dto.auth.RefreshTokenRequest;
import com.ufpa.SAGUI.dto.auth.RefreshTokenResponse;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.RefreshToken;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.RefreshTokenRepository;
import com.ufpa.SAGUI.repository.UserRepository;

import com.ufpa.SAGUI.dto.auth.RegisterRequest;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.email()).orElseThrow(
            () -> new BadCredentialsException("Credenciais inválidas")
        );

        if(!passwordEncoder.matches(request.password(), user.getPassword())){
            throw new BadCredentialsException("Credenciais inválidas");
        }

        String accessToken = jwtService.generateToken(user);

        RefreshToken refreshToken = refreshTokenService.criaRefreshToken(user.getEmail());
        
        return new LoginResponse(accessToken, refreshToken.getToken());
    }

    @Transactional
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
        RefreshToken refreshToken = refreshTokenService.criaRefreshToken(savedUser.getEmail());

        return new LoginResponse(token, refreshToken.getToken());
    }

    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request){
        return refreshTokenRepository.findByToken(request.refreshToken())
            .map(refreshTokenService::verificaExpiracao)
            .map(RefreshToken::getUser)
            .map(user -> {
                String newAccessToken = jwtService.generateToken(user);
                RefreshToken newRefreshToken = refreshTokenService.criaRefreshToken(user.getEmail());

                return new RefreshTokenResponse(newAccessToken, newRefreshToken.getToken());
            }).orElseThrow(
                () -> new RuntimeException("Refresh token não encontrado no banco")
            );
    }
}
