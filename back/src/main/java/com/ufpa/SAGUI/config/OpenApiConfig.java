package com.ufpa.SAGUI.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI saguiOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SAGUI API")
                        .description("API do Sistema de Gestão Acadêmica da UFPA")
                        .version("0.0.1")
                        .contact(new Contact()
                                .name("UFPA")
                                .email("sagui@ufpa.br")))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token JWT obtido em POST /api/auth/login")));
    }
}
