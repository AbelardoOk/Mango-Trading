package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.request.LoginRequest;
import com.mangotrading.mangotrading.dto.request.RegisterRequest;
import com.mangotrading.mangotrading.dto.response.JwtResponse;
import com.mangotrading.mangotrading.dto.response.UserResponse;
import com.mangotrading.mangotrading.entity.Portfolio;
import com.mangotrading.mangotrading.entity.User;
import com.mangotrading.mangotrading.entity.enums.Role;
import com.mangotrading.mangotrading.exception.BadRequestException;
import com.mangotrading.mangotrading.repository.PortfolioRepository;
import com.mangotrading.mangotrading.repository.UserRepository;
import com.mangotrading.mangotrading.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email já cadastrado");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        user = userRepository.save(user);

        Portfolio portfolio = Portfolio.builder()
                .user(user)
                .build();
        portfolioRepository.save(portfolio);

        return toUserResponse(user);
    }

    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Usuário não encontrado"));

        return new JwtResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .balance(user.getBalance())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
