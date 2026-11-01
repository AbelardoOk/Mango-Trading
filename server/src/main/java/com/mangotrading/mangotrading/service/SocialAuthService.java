package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.request.GoogleLoginRequest;
import com.mangotrading.mangotrading.dto.request.TiktokLoginRequest;
import com.mangotrading.mangotrading.dto.response.JwtResponse;
import com.mangotrading.mangotrading.entity.Portfolio;
import com.mangotrading.mangotrading.entity.User;
import com.mangotrading.mangotrading.entity.enums.Role;
import com.mangotrading.mangotrading.exception.BadRequestException;
import com.mangotrading.mangotrading.repository.PortfolioRepository;
import com.mangotrading.mangotrading.repository.UserRepository;
import com.mangotrading.mangotrading.security.GoogleTokenVerifier;
import com.mangotrading.mangotrading.security.GoogleTokenVerifier.GoogleProfile;
import com.mangotrading.mangotrading.security.JwtTokenProvider;
import com.mangotrading.mangotrading.security.TiktokOAuthClient;
import com.mangotrading.mangotrading.security.TiktokOAuthClient.TiktokProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SocialAuthService {

    // O TikTok não informa e-mail; o e-mail é o identificador do sistema (JWT subject), então geramos um interno.
    private static final String TIKTOK_EMAIL_PREFIX = "tiktok_";
    private static final String TIKTOK_EMAIL_DOMAIN = "@tiktok.mango.local";
    private static final String TIKTOK_DEFAULT_NAME = "Usuário TikTok";

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final TiktokOAuthClient tiktokOAuthClient;

    @Transactional
    public JwtResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleProfile profile = googleTokenVerifier.verify(request.getIdToken());

        User user = userRepository.findByGoogleId(profile.getSub())
                .orElseGet(() -> linkOrCreateGoogleUser(profile));

        return toJwtResponse(user);
    }

    @Transactional
    public JwtResponse loginWithTiktok(TiktokLoginRequest request) {
        TiktokProfile profile = tiktokOAuthClient.fetchProfile(request.getCode(), request.getRedirectUri());

        User user = userRepository.findByTiktokId(profile.getOpenId())
                .orElseGet(() -> createTiktokUser(profile));

        return toJwtResponse(user);
    }

    private User linkOrCreateGoogleUser(GoogleProfile profile) {
        if (!StringUtils.hasText(profile.getEmail()) || !profile.isEmailVerified()) {
            throw new BadRequestException("Email do Google não verificado");
        }

        // Vincula à conta existente quando o e-mail (verificado pelo Google) já está cadastrado
        Optional<User> existing = userRepository.findByEmail(profile.getEmail());
        if (existing.isPresent()) {
            User user = existing.get();
            user.setGoogleId(profile.getSub());
            return userRepository.save(user);
        }

        String name = StringUtils.hasText(profile.getName()) ? profile.getName() : profile.getEmail();
        return createSocialUser(name, profile.getEmail(), profile.getSub(), null);
    }

    private User createTiktokUser(TiktokProfile profile) {
        String name = StringUtils.hasText(profile.getDisplayName()) ? profile.getDisplayName() : TIKTOK_DEFAULT_NAME;
        String email = TIKTOK_EMAIL_PREFIX + profile.getOpenId() + TIKTOK_EMAIL_DOMAIN;
        return createSocialUser(name, email, null, profile.getOpenId());
    }

    private User createSocialUser(String name, String email, String googleId, String tiktokId) {
        User user = User.builder()
                .name(name)
                .email(email)
                // Conta social não tem senha: guarda um hash aleatório que ninguém conhece
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .googleId(googleId)
                .tiktokId(tiktokId)
                .role(Role.USER)
                .build();

        user = userRepository.save(user);

        Portfolio portfolio = Portfolio.builder()
                .user(user)
                .build();
        portfolioRepository.save(portfolio);

        return user;
    }

    private JwtResponse toJwtResponse(User user) {
        String jwt = tokenProvider.generateTokenFromEmail(user.getEmail());
        return new JwtResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
