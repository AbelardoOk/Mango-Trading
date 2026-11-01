package com.mangotrading.mangotrading.controller;

import com.mangotrading.mangotrading.dto.response.PricePointResponse;
import com.mangotrading.mangotrading.dto.response.StockResponse;
import com.mangotrading.mangotrading.service.StockHistoryService;
import com.mangotrading.mangotrading.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final StockHistoryService stockHistoryService;

    @GetMapping
    public ResponseEntity<List<StockResponse>> getAllActive() {
        return ResponseEntity.ok(stockService.findActive());
    }

    @GetMapping("/all")
    public ResponseEntity<List<StockResponse>> getAll() {
        return ResponseEntity.ok(stockService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.findById(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<PricePointResponse>> getHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1D") String range) {
        return ResponseEntity.ok(stockHistoryService.getHistory(id, range));
    }
}
