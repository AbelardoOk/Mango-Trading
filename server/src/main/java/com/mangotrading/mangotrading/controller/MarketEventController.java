package com.mangotrading.mangotrading.controller;

import com.mangotrading.mangotrading.dto.response.MarketEventResponse;
import com.mangotrading.mangotrading.service.MarketEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class MarketEventController {

    private final MarketEventService marketEventService;

    @GetMapping
    public ResponseEntity<List<MarketEventResponse>> getAll() {
        return ResponseEntity.ok(marketEventService.findAll());
    }
}
