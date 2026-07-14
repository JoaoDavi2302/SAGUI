package com.ufpa.SAGUI.service.auth;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ufpa.SAGUI.models.auth.RefreshToken;
import com.ufpa.SAGUI.models.user.User;
import com.ufpa.SAGUI.repository.auth.RefreshTokenRepository;
import com.ufpa.SAGUI.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Transactional
    public RefreshToken criaRefreshToken(String username){
        User user = userRepository.findByEmail(username).orElseThrow(
            () -> new RuntimeException("usuario não encontrado")
        );

        refreshTokenRepository.deleteByUser(user);

        refreshTokenRepository.flush();

        RefreshToken refreshToken = RefreshToken.builder()
            .token(UUID.randomUUID().toString())
            .expiryDate(Instant.now().plusSeconds(86400))
            .user(user)
            .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken verificaExpiracao(RefreshToken token){
        if(token.getExpiryDate().isBefore(Instant.now())){
            refreshTokenRepository.delete(token);
            throw new BadCredentialsException("Credenciais inválidas");
        }

        return token;
    }

}
