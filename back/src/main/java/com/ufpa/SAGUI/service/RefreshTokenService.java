package com.ufpa.SAGUI.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ufpa.SAGUI.models.RefreshToken;
import com.ufpa.SAGUI.models.User;
import com.ufpa.SAGUI.repository.RefreshTokenRepository;
import com.ufpa.SAGUI.repository.UserRepository;

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
            throw new RuntimeException("Sessão expirada! faça login novamente");
        }

        return token;
    }

}
