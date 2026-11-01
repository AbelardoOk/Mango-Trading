package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.response.PortfolioHistoryPointResponse;
import com.mangotrading.mangotrading.entity.Stock;
import com.mangotrading.mangotrading.entity.StockPriceHistory;
import com.mangotrading.mangotrading.entity.Transaction;
import com.mangotrading.mangotrading.entity.User;
import com.mangotrading.mangotrading.entity.enums.TransactionType;
import com.mangotrading.mangotrading.repository.PortfolioSnapshotRepository;
import com.mangotrading.mangotrading.repository.StockPriceHistoryRepository;
import com.mangotrading.mangotrading.repository.TransactionRepository;
import com.mangotrading.mangotrading.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioHistoryServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private StockPriceHistoryRepository priceHistoryRepository;

    @Mock
    private PortfolioSnapshotRepository snapshotRepository;

    @Mock
    private PortfolioService portfolioService;

    @Mock
    private SseService sseService;

    @InjectMocks
    private PortfolioHistoryService service;

    @Test
    void reconstructsPatrimonyFromTransactionsAndPriceHistory() {
        LocalDateTime now = LocalDateTime.now();
        User user = User.builder()
                .id(1L)
                .name("Jogador")
                .balance(new BigDecimal("9000.0000"))
                .createdAt(now.minusDays(2))
                .build();
        Stock stock = Stock.builder()
                .id(1L)
                .symbol("AURA3")
                .currentPrice(new BigDecimal("12.0000"))
                .build();
        Transaction buy = Transaction.builder()
                .user(user)
                .stock(stock)
                .type(TransactionType.BUY)
                .quantity(100)
                .price(new BigDecimal("10.0000"))
                .createdAt(now.minusHours(2))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(transactionRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(buy));
        when(snapshotRepository.findByUserIdAndCapturedAtBetweenOrderByCapturedAtAsc(
                anyLong(), any(), any())).thenReturn(List.of());
        when(priceHistoryRepository.findByStockIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                anyLong(), any(), any())).thenReturn(List.of(
                StockPriceHistory.builder().stock(stock)
                        .price(new BigDecimal("10.0000"))
                        .createdAt(now.minusHours(1)).build(),
                StockPriceHistory.builder().stock(stock)
                        .price(new BigDecimal("12.0000"))
                        .createdAt(now.minusMinutes(10)).build()));

        List<PortfolioHistoryPointResponse> points = service.getHistory(1L, "1D");

        assertFalse(points.isEmpty());
        PortfolioHistoryPointResponse last = points.get(points.size() - 1);
        assertEquals(new BigDecimal("10200.0000"), last.getPatrimony());
        assertEquals(new BigDecimal("9000.0000"), last.getBalance());
        assertEquals(new BigDecimal("1200.0000"), last.getStockValue());
    }
}
