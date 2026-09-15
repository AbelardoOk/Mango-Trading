package com.mangotrading.mangotrading.controller;

import com.mangotrading.mangotrading.dto.request.MarketEventRequest;
import com.mangotrading.mangotrading.dto.response.MarketEventResponse;
import com.mangotrading.mangotrading.service.MarketEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMarketEventController {

    private final MarketEventService marketEventService;

    @GetMapping
    public ResponseEntity<List<MarketEventResponse>> getAll() {
        return ResponseEntity.ok(marketEventService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketEventResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(marketEventService.findById(id));
    }

    @PostMapping
    public ResponseEntity<MarketEventResponse> create(@Valid @RequestBody MarketEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marketEventService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarketEventResponse> update(@PathVariable Long id, @Valid @RequestBody MarketEventRequest request) {
        return ResponseEntity.ok(marketEventService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        marketEventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
