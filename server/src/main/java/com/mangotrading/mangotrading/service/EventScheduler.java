package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.entity.MarketEvent;
import com.mangotrading.mangotrading.entity.MarketEventOccurrence;
import com.mangotrading.mangotrading.entity.Stock;
import com.mangotrading.mangotrading.entity.StockPriceHistory;
import com.mangotrading.mangotrading.entity.enums.EventDirection;
import com.mangotrading.mangotrading.entity.enums.EventScope;
import com.mangotrading.mangotrading.repository.MarketEventOccurrenceRepository;
import com.mangotrading.mangotrading.repository.MarketEventRepository;
import com.mangotrading.mangotrading.repository.StockPriceHistoryRepository;
import com.mangotrading.mangotrading.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventScheduler {

    private final MarketEventRepository marketEventRepository;
    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository stockPriceHistoryRepository;
    private final MarketEventOccurrenceRepository occurrenceRepository;
    private final MarketEventService marketEventService;

    @Value("${events.scheduler.enabled:true}")
    private boolean schedulerEnabled;

    @Value("${events.impact.low:1.0}")
    private BigDecimal lowPercent;

    @Value("${events.impact.medium:2.5}")
    private BigDecimal mediumPercent;

    @Value("${events.impact.high:5.0}")
    private BigDecimal highPercent;

    @Value("${events.delta.clamp-percent:15.0}")
    private BigDecimal clampPercent;

    @Scheduled(fixedDelayString = "${events.scheduler.delay-ms:30000}")
    @Transactional
    public void tick() {
        if (!schedulerEnabled) return;
        LocalDateTime now = LocalDateTime.now();
        List<MarketEvent> due = marketEventRepository.findByEnabledTrueAndNextRunAtBefore(now);
        if (due.isEmpty()) return;

        // Group deltas per stock to sum (req 5)
        Map<Long, BigDecimal> deltaPerStock = new HashMap<>();
        Map<Long, List<MarketEvent>> eventsPerStock = new HashMap<>();
        Map<Long, Stock> stockCache = new HashMap<>();

        for (MarketEvent event : due) {
            List<Stock> affected = resolveStocks(event);
            if (affected.isEmpty()) {
                log.warn("Event {} has no affected stocks (scope {} sector {})", event.getId(), event.getScope(), event.getSector());
            }
            for (Stock s : affected) {
                BigDecimal delta = computeDeltaForStock(event, s);
                deltaPerStock.merge(s.getId(), delta, BigDecimal::add);
                eventsPerStock.computeIfAbsent(s.getId(), k -> new ArrayList<>()).add(event);
                stockCache.putIfAbsent(s.getId(), s);
            }
        }

        // Apply summed deltas
        for (Map.Entry<Long, BigDecimal> e : deltaPerStock.entrySet()) {
            Long stockId = e.getKey();
            BigDecimal sumDelta = e.getValue();
            // clamp sum
            if (sumDelta.abs().compareTo(clampPercent) > 0) {
                sumDelta = sumDelta.signum() > 0 ? clampPercent : clampPercent.negate();
            }
            Stock stock = stockCache.get(stockId);
            BigDecimal oldPrice = stock.getCurrentPrice();
            BigDecimal newPrice = oldPrice.multiply(BigDecimal.ONE.add(sumDelta.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)));
            if (newPrice.compareTo(new BigDecimal("0.01")) < 0) newPrice = new BigDecimal("0.01");
            newPrice = newPrice.setScale(4, RoundingMode.HALF_UP);
            stock.setCurrentPrice(newPrice);
            stockRepository.save(stock);
            StockPriceHistory h = StockPriceHistory.builder().stock(stock).price(newPrice).build();
            stockPriceHistoryRepository.save(h);

            // create occurrences for audit
            for (MarketEvent ev : eventsPerStock.get(stockId)) {
                BigDecimal singleDelta = computeDeltaForStock(ev, stock);
                MarketEventOccurrence occ = MarketEventOccurrence.builder()
                        .event(ev)
                        .stock(stock)
                        .deltaPercent(singleDelta)
                        .oldPrice(oldPrice)
                        .newPrice(newPrice)
                        .executedAt(now)
                        .build();
                occurrenceRepository.save(occ);
            }
            log.info("EventScheduler: stock {} {} -> {} (deltaSum {}% from {} events)", stock.getSymbol(), oldPrice, newPrice, sumDelta, eventsPerStock.get(stockId).size());
        }

        // Update events nextRunAt/start/end
        for (MarketEvent event : due) {
            LocalDateTime start = now;
            int duration = event.getDurationMinutes() != null ? event.getDurationMinutes() : 60;
            event.setStartDate(start);
            event.setEndDate(start.plusMinutes(duration));
            event.setLastRunAt(now);
            LocalDateTime next = marketEventService.computeNextRunAt(event, now.plusSeconds(1));
            event.setNextRunAt(next);
            if (next == null) {
                event.setEnabled(false);
            }
            marketEventRepository.save(event);
            log.info("Event {} '{}' executed, nextRunAt={}", event.getId(), event.getTitle(), next);
        }
    }

    private List<Stock> resolveStocks(MarketEvent event) {
        if (event.getScope() == EventScope.SECTOR && event.getSector() != null && !event.getSector().isBlank()) {
            return stockRepository.findBySectorAndActiveTrue(event.getSector());
        }
        return stockRepository.findByActiveTrue();
    }

    private BigDecimal computeDeltaForStock(MarketEvent event, Stock stock) {
        BigDecimal base;
        if (event.getPriceDeltaPercent() != null) {
            base = event.getPriceDeltaPercent().abs();
        } else {
            switch (event.getImpact()) {
                case LOW -> base = lowPercent;
                case HIGH -> base = highPercent;
                default -> base = mediumPercent;
            }
        }
        int sign;
        if (event.getDirection() == EventDirection.POSITIVE) sign = 1;
        else if (event.getDirection() == EventDirection.NEGATIVE) sign = -1;
        else sign = ThreadLocalRandom.current().nextBoolean() ? 1 : -1;
        BigDecimal delta = base.multiply(BigDecimal.valueOf(sign));
        // volatility multiplier: 1 + volatility*0.5 (e.g., volatility 0.02 => +1%)
        if (stock.getVolatility() != null) {
            BigDecimal volFactor = BigDecimal.ONE.add(stock.getVolatility().multiply(BigDecimal.valueOf(0.5)));
            delta = delta.multiply(volFactor);
        }
        return delta;
    }
}
