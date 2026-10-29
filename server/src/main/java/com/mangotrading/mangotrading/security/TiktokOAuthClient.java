package com.mangotrading.mangotrading.security;

import com.mangotrading.mangotrading.exception.BadRequestException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

/**
 * Troca o código de autorização do TikTok Login Kit (web) pelo perfil básico do usuário.
 * O client secret fica apenas no back-end.
 */
@Slf4j
@Component
public class TiktokOAuthClient {

    private static final String TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
    private static final String USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name";
    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE = new ParameterizedTypeReference<>() {};

    private final String clientKey;
    private final String clientSecret;
    private final RestClient restClient = RestClient.create();

    public TiktokOAuthClient(
            @Value("${tiktok.client-key}") String clientKey,
            @Value("${tiktok.client-secret}") String clientSecret) {
        this.clientKey = clientKey;
        this.clientSecret = clientSecret;
    }

    public TiktokProfile fetchProfile(String code, String redirectUri) {
        if (isBlank(clientKey) || isBlank(clientSecret)) {
            throw new IllegalStateException("Login com TikTok não configurado");
        }

        Map<String, Object> token;
        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("client_key", clientKey);
            form.add("client_secret", clientSecret);
            form.add("code", code);
            form.add("grant_type", "authorization_code");
            form.add("redirect_uri", redirectUri);

            token = restClient.post()
                    .uri(TOKEN_URL)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(MAP_TYPE);
        } catch (RestClientException ex) {
            log.warn("Falha ao trocar o código do TikTok: {}", ex.getMessage());
            throw new BadRequestException("Não foi possível autenticar com o TikTok");
        }

        String accessToken = asString(token == null ? null : token.get("access_token"));
        String openId = asString(token == null ? null : token.get("open_id"));
        if (accessToken == null || openId == null) {
            log.warn("Resposta do TikTok sem access_token/open_id: {}",
                    token == null ? null : token.get("error"));
            throw new BadRequestException("Não foi possível autenticar com o TikTok");
        }

        return new TiktokProfile(openId, fetchDisplayName(accessToken));
    }

    // O nome é opcional: se a consulta falhar, o login continua só com o open_id.
    private String fetchDisplayName(String accessToken) {
        try {
            Map<String, Object> info = restClient.get()
                    .uri(USER_INFO_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .body(MAP_TYPE);
            if (info != null && info.get("data") instanceof Map<?, ?> data
                    && data.get("user") instanceof Map<?, ?> user) {
                return asString(user.get("display_name"));
            }
        } catch (RestClientException ex) {
            log.warn("Não foi possível obter o perfil do TikTok: {}", ex.getMessage());
        }
        return null;
    }

    private static String asString(Object value) {
        return value instanceof String s && !s.isBlank() ? s : null;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Getter
    @AllArgsConstructor
    public static class TiktokProfile {
        private final String openId;
        private final String displayName;
    }
}
