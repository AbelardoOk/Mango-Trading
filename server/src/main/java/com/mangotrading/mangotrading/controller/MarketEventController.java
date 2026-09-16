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
        // Player sees only UPCOMING (3min before) and ACTIVE; if no scheduling, falls back to all enabled
        List<MarketEventResponse> visible = marketEventService.findVisibleForPlayer();
        // If visible is empty but there are scheduled events, return all for backward compat? No, return visible
        if (visible.isEmpty()) {
            // fallback to all enabled for NONE recurrence to not hide manual events
            return ResponseEntity.ok(marketEventService.findAll().stream()
                    .filter(r -> !"ENDED".equals(r.getStatus()))
                    .toList());
        }
        return ResponseEntity.ok(visible);
    }

    @GetMapping("/all")
    public ResponseEntity<List<MarketEventResponse>> getAllAdminView() {
        return ResponseEntity.ok(marketEventService.findAll());
    }
}
