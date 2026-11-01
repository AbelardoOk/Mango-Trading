package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.response.PortfolioHistoryPointResponse;
import com.mangotrading.mangotrading.dto.response.PortfolioLiveResponse;
import com.mangotrading.mangotrading.dto.response.PortfolioResponse;
import com.mangotrading.mangotrading.entity.PortfolioSnapshot;
import com.mangotrading.mangotrading.entity.Stock;
import com.mangotrading.mangotrading.entity.StockPriceHistory;
import com.mangotrading.mangotrading.entity.Transaction;
import com.mangotrading.mangotrading.entity.User;
import com.mangotrading.mangotrading.entity.enums.TransactionType;
import com.mangotrading.mangotrading.exception.BadRequestException;
import com.mangotrading.mangotrading.exception.ResourceNotFoundException;
import com.mangotrading.mangotrading.repository.PortfolioSnapshotRepository;
import com.mangotrading.mangotrading.repository.StockPriceHistoryRepository;
import com.mangotrading.mangotrading.repository.TransactionRepository;
import com.mangotrading.mangotrading.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioHistoryService {

    private static final int MAX_POINTS = 240;

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final StockPriceHistoryRepository priceHistoryRepository;
    private final PortfolioSnapshotRepository snapshotRepository;
    private final PortfolioService portfolioService;
    private final SseService sseService;

    @Transactional(readOnly = true)
    public List<PortfolioHistoryPointResponse> getHistory(Long userId, String range) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userId));

        Duration window = resolveWindow(range);
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minus(window);
        if (user.getCreatedAt() != null && user.getCreatedAt().isAfter(from)) {
            from = user.getCreatedAt();
        }

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().isAfter(to))
                .sorted(Comparator.comparing(Transaction::getCreatedAt))
                .toList();

        List<PortfolioSnapshot> snapshots = snapshotRepository
                .findByUserIdAndCapturedAtBetweenOrderByCapturedAtAsc(userId, from, to);

        if (transactions.isEmpty() && snapshots.isEmpty()) {
            BigDecimal balance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
            return List.of(point(max(user.getCreatedAt(), from), balance, BigDecimal.ZERO));
        }

        Duration bucket = resolveBucket(window, from, to);
        List<PortfolioHistoryPointResponse> reconstructed = reconstruct(user, transactions, from, to, bucket);
        return merge(reconstructed, snapshots, bucket);
    }

    @Transactional
    public PortfolioLiveResponse captureSnapshot(Long userId) {
        PortfolioResponse portfolio = portfolioService.getPortfolioByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        PortfolioHistoryPointResponse point = point(
                now,
                portfolio.getBalance(),
                portfolio.getTotalCurrentValue());

        Optional<PortfolioSnapshot> last = snapshotRepository.findTopByUserIdOrderByCapturedAtDesc(userId);
        boolean unchanged = last.isPresent()
                && last.get().getCapturedAt() != null
                && last.get().getCapturedAt().isAfter(now.minusSeconds(30))
                && last.get().getBalance().compareTo(portfolio.getBalance()) == 0
                && last.get().getStockValue().compareTo(portfolio.getTotalCurrentValue()) == 0;

        if (!unchanged) {
            User user = userRepository.getReferenceById(userId);
            snapshotRepository.save(PortfolioSnapshot.builder()
                    .user(user)
                    .balance(portfolio.getBalance())
                    .stockValue(portfolio.getTotalCurrentValue())
                    .patrimony(portfolio.getTotalPatrimony())
                    .capturedAt(now)
                    .build());
        }

        return PortfolioLiveResponse.builder()
                .portfolio(portfolio)
                .point(point)
                .build();
    }

    @Transactional
    public void captureAndBroadcast(Long userId) {
        try {
            PortfolioLiveResponse live = captureSnapshot(userId);
            sseService.broadcastPortfolio(userId, live);
        } catch (Exception e) {
            log.debug("Portfolio snapshot skipped for user {}: {}", userId, e.getMessage());
        }
    }

    private List<PortfolioHistoryPointResponse> reconstruct(
            User user,
            List<Transaction> transactions,
            LocalDateTime from,
            LocalDateTime to,
            Duration bucket) {

        List<LocalDateTime> boundaries = boundaries(from, to, bucket);
        BigDecimal startingBalance = startingBalance(user, transactions);

        Set<Long> stockIds = new HashSet<>();
        Map<Long, BigDecimal> fallbackPrices = new HashMap<>();
        Map<Long, Stock> stocks = new HashMap<>();
        for (Transaction tx : transactions) {
            Stock stock = tx.getStock();
            stockIds.add(stock.getId());
            stocks.put(stock.getId(), stock);
            fallbackPrices.put(stock.getId(), tx.getPrice());
        }

        Map<Long, List<StockPriceHistory>> series = new HashMap<>();
        for (Long stockId : stockIds) {
            series.put(stockId, priceHistoryRepository
                    .findByStockIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                            stockId, from.minusDays(1), to));
        }

        Map<Long, Integer> holdings = new HashMap<>();
        BigDecimal balance = startingBalance;
        int txIndex = 0;
        List<PortfolioHistoryPointResponse> points = new ArrayList<>();

        for (LocalDateTime boundary : boundaries) {
            while (txIndex < transactions.size()
                    && !transactions.get(txIndex).getCreatedAt().isAfter(boundary)) {
                Transaction tx = transactions.get(txIndex++);
                BigDecimal total = tx.getPrice().multiply(BigDecimal.valueOf(tx.getQuantity()));
                Long stockId = tx.getStock().getId();
                if (tx.getType() == TransactionType.BUY) {
                    balance = balance.subtract(total);
                    holdings.merge(stockId, tx.getQuantity(), Integer::sum);
                } else {
                    balance = balance.add(total);
                    int remaining = holdings.getOrDefault(stockId, 0) - tx.getQuantity();
                    if (remaining <= 0) {
                        holdings.remove(stockId);
                    } else {
                        holdings.put(stockId, remaining);
                    }
                }
            }

            BigDecimal stockValue = BigDecimal.ZERO;
            for (Map.Entry<Long, Integer> entry : holdings.entrySet()) {
                BigDecimal price = priceAt(
                        series.get(entry.getKey()),
                        boundary,
                        fallbackPrices.getOrDefault(entry.getKey(),
                                stocks.get(entry.getKey()) != null
                                        ? stocks.get(entry.getKey()).getCurrentPrice()
                                        : BigDecimal.ZERO));
                stockValue = stockValue.add(price.multiply(BigDecimal.valueOf(entry.getValue())));
            }

            points.add(point(boundary, balance, stockValue));
        }

        return points;
    }

    private BigDecimal startingBalance(User user, List<Transaction> transactions) {
        BigDecimal netFlow = BigDecimal.ZERO;
        for (Transaction tx : transactions) {
            BigDecimal total = tx.getPrice().multiply(BigDecimal.valueOf(tx.getQuantity()));
            if (tx.getType() == TransactionType.BUY) {
                netFlow = netFlow.subtract(total);
            } else {
                netFlow = netFlow.add(total);
            }
        }
        BigDecimal current = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        return current.subtract(netFlow);
    }

    private BigDecimal priceAt(List<StockPriceHistory> series, LocalDateTime at, BigDecimal fallback) {
        if (series == null || series.isEmpty()) {
            return fallback;
        }
        BigDecimal price = fallback;
        for (StockPriceHistory h : series) {
            if (h.getCreatedAt() == null || h.getCreatedAt().isAfter(at)) {
                break;
            }
            price = h.getPrice();
        }
        return price;
    }

    private List<PortfolioHistoryPointResponse> merge(
            List<PortfolioHistoryPointResponse> reconstructed,
            List<PortfolioSnapshot> snapshots,
            Duration bucket) {

        Map<Long, PortfolioHistoryPointResponse> byBucket = new TreeMap<>();
        for (PortfolioHistoryPointResponse p : reconstructed) {
            byBucket.put(bucketKey(p.getTimestamp(), bucket), p);
        }
        for (PortfolioSnapshot s : snapshots) {
            byBucket.put(bucketKey(s.getCapturedAt(), bucket), point(
                    s.getCapturedAt(), s.getBalance(), s.getStockValue()));
        }
        return new ArrayList<>(byBucket.values());
    }

    private List<LocalDateTime> boundaries(LocalDateTime from, LocalDateTime to, Duration bucket) {
        List<LocalDateTime> result = new ArrayList<>();
        LocalDateTime cursor = from;
        while (cursor.isBefore(to)) {
            result.add(cursor);
            cursor = cursor.plus(bucket);
        }
        result.add(to);
        return result;
    }

    private long bucketKey(LocalDateTime timestamp, Duration bucket) {
        long seconds = bucket.getSeconds() > 0 ? bucket.getSeconds() : 1;
        return timestamp.toEpochSecond(ZoneOffset.UTC) / seconds;
    }

    private Duration resolveBucket(Duration window, LocalDateTime from, LocalDateTime to) {
        long seconds = Math.max(1, Duration.between(from, to).getSeconds());
        long candidate;
        if (window.toHours() <= 1) {
            candidate = 60;
        } else if (window.toDays() <= 1) {
            candidate = 15 * 60;
        } else if (window.toDays() <= 7) {
            candidate = 2 * 60 * 60;
        } else {
            candidate = 6 * 60 * 60;
        }
        long minimum = Math.max(1, seconds / MAX_POINTS);
        return Duration.ofSeconds(Math.max(candidate, minimum));
    }

    private Duration resolveWindow(String range) {
        String normalized = range == null ? "7D" : range.trim().toUpperCase();
        return switch (normalized) {
            case "1H" -> Duration.ofHours(1);
            case "1D" -> Duration.ofDays(1);
            case "7D" -> Duration.ofDays(7);
            case "30D" -> Duration.ofDays(30);
            default -> throw new BadRequestException("Range inválido: " + range + ". Use 1H, 1D, 7D ou 30D");
        };
    }

    private PortfolioHistoryPointResponse point(
            LocalDateTime timestamp, BigDecimal balance, BigDecimal stockValue) {
        BigDecimal normalizedBalance = scale(balance);
        BigDecimal normalizedStockValue = scale(stockValue);
        return PortfolioHistoryPointResponse.builder()
                .timestamp(timestamp)
                .balance(normalizedBalance)
                .stockValue(normalizedStockValue)
                .patrimony(normalizedBalance.add(normalizedStockValue))
                .build();
    }

    private BigDecimal scale(BigDecimal value) {
        return (value != null ? value : BigDecimal.ZERO).setScale(4, RoundingMode.HALF_UP);
    }

    private LocalDateTime max(LocalDateTime a, LocalDateTime b) {
        if (a == null) return b;
        if (b == null) return a;
        return a.isAfter(b) ? a : b;
    }
}
