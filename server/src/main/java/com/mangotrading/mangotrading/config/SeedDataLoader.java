package com.mangotrading.mangotrading.config;

import com.mangotrading.mangotrading.dto.request.MarketEventRequest;
import com.mangotrading.mangotrading.entity.Stock;
import com.mangotrading.mangotrading.repository.StockRepository;
import com.mangotrading.mangotrading.service.MarketEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@Order(2) // after AdminSeeder (Order 1 if added, else default)
@RequiredArgsConstructor
public class SeedDataLoader implements CommandLineRunner {

    private final StockRepository stockRepository;
    private final MarketEventService marketEventService;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        seedStocks();
        seedEvents();
    }

    private void seedStocks() throws Exception {
        if (stockRepository.count() > 0) {
            log.info("SeedDataLoader: stocks already populated ({}), skipping", stockRepository.count());
            return;
        }
        ClassPathResource res = new ClassPathResource("seed/stocks.json");
        if (!res.exists()) {
            log.warn("SeedDataLoader: seed/stocks.json not found");
            return;
        }
        List<Map<String, Object>> list = objectMapper.readValue(res.getInputStream(), new TypeReference<>() {});
        int created = 0;
        for (Map<String, Object> m : list) {
            String symbol = ((String) m.get("symbol")).toUpperCase();
            if (stockRepository.existsBySymbol(symbol)) continue;
            Stock s = Stock.builder()
                    .name((String) m.get("name"))
                    .symbol(symbol)
                    .description((String) m.get("description"))
                    .sector((String) m.get("sector"))
                    .currentPrice(new BigDecimal(m.get("currentPrice").toString()))
                    .volatility(m.get("volatility") != null ? new BigDecimal(m.get("volatility").toString()) : BigDecimal.ZERO)
                    .active(m.get("active") == null || (Boolean) m.get("active"))
                    .build();
            stockRepository.save(s);
            created++;
        }
        log.info("SeedDataLoader: created {} stocks from seed/stocks.json", created);
    }

    private void seedEvents() throws Exception {
        // Use count via repository: if any enabled event exists, skip to avoid duplicating on restart
        // Check if any event with recurrence exists
        ClassPathResource res = new ClassPathResource("seed/events.json");
        if (!res.exists()) {
            log.warn("SeedDataLoader: seed/events.json not found");
            return;
        }
        // Only seed if no events at all (first boot)
        // We check total count via service: findAll
        if (!marketEventService.findAll().isEmpty()) {
            // But allow seeding if only old manual events exist? For now skip if any exists
            log.info("SeedDataLoader: events already populated, skipping");
            return;
        }
        List<Map<String, Object>> list = objectMapper.readValue(res.getInputStream(), new TypeReference<>() {});
        int created = 0;
        for (Map<String, Object> m : list) {
            try {
                MarketEventRequest req = new MarketEventRequest();
                req.setTitle((String) m.get("title"));
                req.setDescription((String) m.get("description"));
                req.setImpact((String) m.get("impact"));
                req.setRecurrenceType((String) m.get("recurrenceType"));
                // dailyTime as HH:mm string -> LocalTime
                if (m.get("dailyTime") != null) {
                    req.setDailyTime(java.time.LocalTime.parse((String) m.get("dailyTime")));
                }
                if (m.get("randomMin") != null) req.setRandomMin((String) m.get("randomMin"));
                if (m.get("randomMax") != null) req.setRandomMax((String) m.get("randomMax"));
                if (m.get("durationMinutes") != null) req.setDurationMinutes((Integer) m.get("durationMinutes"));
                if (m.get("scope") != null) req.setScope((String) m.get("scope"));
                if (m.get("sector") != null) req.setSector((String) m.get("sector"));
                if (m.get("priceDeltaPercent") != null) req.setPriceDeltaPercent(new BigDecimal(m.get("priceDeltaPercent").toString()));
                if (m.get("direction") != null) req.setDirection((String) m.get("direction"));
                if (m.get("enabled") != null) req.setEnabled((Boolean) m.get("enabled"));
                if (m.get("visibilityMinutes") != null) req.setVisibilityMinutes((Integer) m.get("visibilityMinutes"));
                if (m.get("daysOfWeek") != null) req.setDaysOfWeek((String) m.get("daysOfWeek"));
                // start/end for NONE
                if (m.get("startDate") != null) req.setStartDate(java.time.LocalDateTime.parse((String) m.get("startDate")));
                if (m.get("endDate") != null) req.setEndDate(java.time.LocalDateTime.parse((String) m.get("endDate")));
                marketEventService.create(req);
                created++;
            } catch (Exception e) {
                log.warn("SeedDataLoader: failed to create event {}: {}", m.get("title"), e.getMessage());
            }
        }
        log.info("SeedDataLoader: created {} events from seed/events.json", created);
    }
}
