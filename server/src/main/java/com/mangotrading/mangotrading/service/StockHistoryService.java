package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.response.PricePointResponse;
import com.mangotrading.mangotrading.entity.Stock;
import com.mangotrading.mangotrading.entity.StockPriceHistory;
import com.mangotrading.mangotrading.exception.BadRequestException;
import com.mangotrading.mangotrading.exception.ResourceNotFoundException;
import com.mangotrading.mangotrading.repository.StockPriceHistoryRepository;
import com.mangotrading.mangotrading.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockHistoryService {

    private static final int MAX_POINTS = 300;

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository priceHistoryRepository;

    @Transactional(readOnly = true)
    public List<PricePointResponse> getHistory(Long stockId, String range) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Ação não encontrada: " + stockId));

        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minus(resolveWindow(range));

        List<StockPriceHistory> history = priceHistoryRepository
                .findByStockIdAndCreatedAtBetweenOrderByCreatedAtAsc(stockId, from, to);

        if (history.isEmpty()) {
            return List.of(PricePointResponse.builder()
                    .timestamp(to)
                    .price(stock.getCurrentPrice())
                    .build());
        }

        List<PricePointResponse> points = new ArrayList<>();
        for (StockPriceHistory h : downsample(history)) {
            points.add(PricePointResponse.builder()
                    .timestamp(h.getCreatedAt())
                    .price(h.getPrice())
                    .build());
        }

        // Always expose the latest known price so charts reflect the live value.
        PricePointResponse last = points.get(points.size() - 1);
        if (last.getPrice().compareTo(stock.getCurrentPrice()) != 0) {
            points.add(PricePointResponse.builder()
                    .timestamp(to)
                    .price(stock.getCurrentPrice())
                    .build());
        }
        return points;
    }

    private java.time.Duration resolveWindow(String range) {
        String normalized = range == null ? "1D" : range.trim().toUpperCase();
        return switch (normalized) {
            case "1H" -> java.time.Duration.ofHours(1);
            case "1D" -> java.time.Duration.ofDays(1);
            case "7D" -> java.time.Duration.ofDays(7);
            case "30D" -> java.time.Duration.ofDays(30);
            default -> throw new BadRequestException("Range inválido: " + range + ". Use 1H, 1D, 7D ou 30D");
        };
    }

    private List<StockPriceHistory> downsample(List<StockPriceHistory> history) {
        if (history.size() <= MAX_POINTS) {
            return history;
        }
        int step = (int) Math.ceil(history.size() / (double) MAX_POINTS);
        List<StockPriceHistory> sampled = new ArrayList<>();
        for (int i = 0; i < history.size(); i += step) {
            sampled.add(history.get(i));
        }
        StockPriceHistory last = history.get(history.size() - 1);
        if (!sampled.get(sampled.size() - 1).equals(last)) {
            sampled.add(last);
        }
        return sampled;
    }
}
