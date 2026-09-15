package com.mangotrading.mangotrading.controller;

import com.mangotrading.mangotrading.dto.response.PortfolioResponse;
import com.mangotrading.mangotrading.security.UserDetailsImpl;
import com.mangotrading.mangotrading.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<PortfolioResponse> getPortfolio(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(portfolioService.getPortfolioByUserId(currentUser.getId()));
    }
}
