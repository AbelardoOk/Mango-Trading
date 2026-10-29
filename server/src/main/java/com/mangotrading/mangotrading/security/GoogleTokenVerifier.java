package com.mangotrading.mangotrading.security;

import com.mangotrading.mangotrading.exception.BadRequestException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Valida o ID token emitido pelo Google Identity Services (assinatura, expiração, emissor e audiência).
 */
@Slf4j
@Component
public class GoogleTokenVerifier {

    private static final String JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final List<String> ISSUERS = List.of("https://accounts.google.com", "accounts.google.com");

    private final String clientId;
    private final JwtDecoder jwtDecoder;

    public GoogleTokenVerifier(@Value("${google.client-id}") String clientId) {
        this.clientId = clientId;

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(JWKS_URI).build();
        OAuth2TokenValidator<Jwt> issuerValidator =
                new JwtClaimValidator<Object>("iss", iss -> iss != null && ISSUERS.contains(iss.toString()));
        OAuth2TokenValidator<Jwt> audienceValidator =
                new JwtClaimValidator<List<String>>("aud", aud -> aud != null && aud.contains(clientId));
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                List.of(JwtValidators.createDefault(), issuerValidator, audienceValidator)));
        this.jwtDecoder = decoder;
    }

    public GoogleProfile verify(String idToken) {
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("Login com Google não configurado");
        }
        try {
            Jwt jwt = jwtDecoder.decode(idToken);
            return new GoogleProfile(
                    jwt.getSubject(),
                    jwt.getClaimAsString("email"),
                    Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified")),
                    jwt.getClaimAsString("name"));
        } catch (JwtException ex) {
            log.warn("Token do Google inválido: {}", ex.getMessage());
            throw new BadRequestException("Token do Google inválido");
        }
    }

    @Getter
    @AllArgsConstructor
    public static class GoogleProfile {
        private final String sub;
        private final String email;
        private final boolean emailVerified;
        private final String name;
    }
}
