package com.ufpa.SAGUI.exception;

import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta padrão de erro da API")
public record ErrorResponse(
    int status,
    String error, 
    String message, 
    String path,
    LocalDateTime timestamp,
    List<FieldError> fields
) {
    public record FieldError(String field, String message){}

    public static ErrorResponse of(int status, String error, String message, String path){
        return new ErrorResponse(status, error, message, path, LocalDateTime.now(), null);
    }

    public static ErrorResponse of(int status, String error, String message, String path, List<FieldError> fields){
        return new ErrorResponse(status, error, message, path, LocalDateTime.now(), fields);
    }
}