package com.ufpa.SAGUI.exception;

import java.lang.module.ResolutionException;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
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

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ErrorResponse>handleAcessDenied(RuntimeException ex, HttpServletRequest request){
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

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(
                        HttpStatus.BAD_REQUEST.value(),
                        "Bad Request",
                        ex.getMessage(),
                        request.getRequestURI()
                ));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse>handleResponseStatus(ResponseStatusException ex, HttpServletRequest request){
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        return ResponseEntity
            .status(ex.getStatusCode())
            .body(ErrorResponse.of(
                ex.getStatusCode().value(), 
                status.getReasonPhrase(), 
                ex.getReason(), 
                request.getRequestURI()
            ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(
                        HttpStatus.CONFLICT.value(),
                        "Conflict",
                        "Operação não permitida: existem registros vinculados a este recurso.",
                        request.getRequestURI()
                ));
    }


    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse>handleRuntime(RuntimeException ex, HttpServletRequest request){
        if (ex instanceof AccessDeniedException || ex instanceof AuthorizationDeniedException) {
            return handleAcessDenied(ex, request);
        }

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
