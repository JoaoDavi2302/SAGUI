package com.ufpa.SAGUI.exception;

import java.lang.module.ResolutionException;
import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandle {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse>HandleValidation(MethodArgumentNotValidException ex, HttpServletRequest request){
        List<ErrorResponse.FieldError> fields = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> new ErrorResponse.FieldError(e.getField(), e.getDefaultMessage()))
            .toList();

        return ResponseEntity.unprocessableContent().body(
            ErrorResponse.of(
                HttpStatus.UNPROCESSABLE_CONTENT.value(),
                "Validation Failed",
                "Um ou mais campos são inválidos",
                request.getRequestURI(),
                fields
            )
        );
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse>handleJwt(JwtException ex, HttpServletRequest request){
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Unauthorized",
                    "Token Inválido ou Expirado",
                    request.getRequestURI()
                ));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse>handleUsernameNotFound(UsernameNotFoundException ex, HttpServletRequest request){
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Unauthorized",
                    ex.getMessage(),
                    request.getRequestURI()
                ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse>handleAcessDenied(AccessDeniedException ex, HttpServletRequest request){
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.of(
                    HttpStatus.FORBIDDEN.value(), 
                    "Forbidden", 
                    "Você não tem permissão para acessar esse recurso", 
                    request.getRequestURI()
                ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse>handleBadCredentials(BadCredentialsException ex, HttpServletRequest request){
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse.of(
                HttpStatus.UNAUTHORIZED.value(), 
                "Unauthorized", 
                ex.getMessage(), 
                request.getRequestURI()
            ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse>handleResponseStatus(ResponseStatusException ex, HttpServletRequest request){
        return ResponseEntity
            .status(ex.getStatusCode())
            .body(ErrorResponse.of(
                ex.getStatusCode().value(), 
                "Unauthorized", 
                ex.getMessage(), 
                request.getRequestURI()
            ));
    }


    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse>handleRuntime(RuntimeException ex, HttpServletRequest request){
        if(ex.getMessage() != null && ex.getMessage().contains("Sessão Expirada")){
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(
                    HttpStatus.UNAUTHORIZED.value(), 
                    "Unauthorized", 
                    ex.getMessage(), 
                    request.getRequestURI()
                ));
        }

        return ResponseEntity
            .internalServerError()
            .body(ErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(), 
                "Internal Server Error", 
                "Ocorreu um erro inesperado", 
                request.getRequestURI()
            ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) { 
        return ResponseEntity
            .internalServerError()
            .body(ErrorResponse.of(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal Server Error",
                    "Ocorreu um erro inesperado",
                    request.getRequestURI()
                ));
    }


}
