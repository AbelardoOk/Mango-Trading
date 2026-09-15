package com.mangotrading.mangotrading.controller;

import com.mangotrading.mangotrading.dto.request.TradeRequest;
import com.mangotrading.mangotrading.dto.response.TransactionResponse;
import com.mangotrading.mangotrading.security.UserDetailsImpl;
import com.mangotrading.mangotrading.service.TradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradingController {

    private final TradingService tradingService;

    @PostMapping("/buy")
    public ResponseEntity<TransactionResponse> buy(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody TradeRequest request) {
        TransactionResponse tx = tradingService.buy(currentUser.getId(), request.getStockId(), request.getQuantity());
        return ResponseEntity.ok(tx);
    }

    @PostMapping("/sell")
    public ResponseEntity<TransactionResponse> sell(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody TradeRequest request) {
        TransactionResponse tx = tradingService.sell(currentUser.getId(), request.getStockId(), request.getQuantity());
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> history(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(tradingService.getHistory(currentUser.getId()));
    }
}
