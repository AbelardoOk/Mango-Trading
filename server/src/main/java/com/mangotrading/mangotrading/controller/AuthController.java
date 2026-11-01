package com.mangotrading.mangotrading.controller;

import com.mangotrading.mangotrading.dto.request.GoogleLoginRequest;
import com.mangotrading.mangotrading.dto.request.LoginRequest;
import com.mangotrading.mangotrading.dto.request.RegisterRequest;
import com.mangotrading.mangotrading.dto.request.TiktokLoginRequest;
import com.mangotrading.mangotrading.dto.response.JwtResponse;
import com.mangotrading.mangotrading.dto.response.UserResponse;
import com.mangotrading.mangotrading.service.AuthService;
import com.mangotrading.mangotrading.service.SocialAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SocialAuthService socialAuthService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse jwt = authService.login(request);
        return ResponseEntity.ok(jwt);
    }

    @PostMapping("/google")
    public ResponseEntity<JwtResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        JwtResponse jwt = socialAuthService.loginWithGoogle(request);
        return ResponseEntity.ok(jwt);
    }

    @PostMapping("/tiktok")
    public ResponseEntity<JwtResponse> loginWithTiktok(@Valid @RequestBody TiktokLoginRequest request) {
        JwtResponse jwt = socialAuthService.loginWithTiktok(request);
        return ResponseEntity.ok(jwt);
    }
}
