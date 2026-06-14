package com.ufpa.SAGUI.auth;

import java.io.IOException;

import com.ufpa.SAGUI.service.UserService;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserService userService;

    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse reponse,
        FilterChain filterChain) throws IOException, ServletException{
            final String authHeader = request.getHeader("authorization");

            if(authHeader == null || !authHeader.startsWith("Bearer ")){
                filterChain.doFilter(request, reponse);
                return;
            }

            String jwt = authHeader.substring(7);
            String email = jwtService.extractEmail(jwt);

            if(email !=  null){
                UserDetails userDetails = userService.loadUserByUsername(email);

                if(jwtService.isTokenValid(jwt, userDetails)){
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        filterChain.doFilter(request, reponse);
    }
}
