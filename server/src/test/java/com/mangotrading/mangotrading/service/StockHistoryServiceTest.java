package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.response.PricePointResponse;
import com.mangotrading.mangotrading.entity.Stock;
import com.mangotrading.mangotrading.entity.StockPriceHistory;
import com.mangotrading.mangotrading.exception.BadRequestException;
import com.mangotrading.mangotrading.repository.StockPriceHistoryRepository;
import com.mangotrading.mangotrading.repository.StockRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StockHistoryServiceTest {

    @Mock
    private StockRepository stockRepository;

    @Mock
    private StockPriceHistoryRepository priceHistoryRepository;

    @InjectMocks
    private StockHistoryService service;

    @Test
    void returnsCurrentPriceWhenNoHistoryExists() {
        Stock stock = Stock.builder().id(1L).symbol("AURA3")
                .currentPrice(new BigDecimal("12.50")).build();
        when(stockRepository.findById(1L)).thenReturn(Optional.of(stock));
        when(priceHistoryRepository.findByStockIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                anyLong(), any(), any())).thenReturn(List.of());

        List<PricePointResponse> points = service.getHistory(1L, "1D");

        assertEquals(1, points.size());
        assertEquals(new BigDecimal("12.50"), points.get(0).getPrice());
    }

    @Test
    void returnsOrderedHistoryPoints() {
        Stock stock = Stock.builder().id(1L).symbol("AURA3")
                .currentPrice(new BigDecimal("12.50")).build();
        StockPriceHistory first = StockPriceHistory.builder()
                .stock(stock).price(new BigDecimal("10.00"))
                .createdAt(LocalDateTime.now().minusHours(2)).build();
        StockPriceHistory second = StockPriceHistory.builder()
                .stock(stock).price(new BigDecimal("11.00"))
                .createdAt(LocalDateTime.now().minusHours(1)).build();

        when(stockRepository.findById(1L)).thenReturn(Optional.of(stock));
        when(priceHistoryRepository.findByStockIdAndCreatedAtBetweenOrderByCreatedAtAsc(
                anyLong(), any(), any())).thenReturn(List.of(first, second));

        List<PricePointResponse> points = service.getHistory(1L, "1D");

        assertEquals(3, points.size());
        assertEquals(new BigDecimal("10.00"), points.get(0).getPrice());
        assertEquals(new BigDecimal("12.50"), points.get(2).getPrice());
    }

    @Test
    void rejectsInvalidRange() {
        Stock stock = Stock.builder().id(1L).symbol("AURA3")
                .currentPrice(BigDecimal.TEN).build();
        when(stockRepository.findById(1L)).thenReturn(Optional.of(stock));

        assertThrows(BadRequestException.class, () -> service.getHistory(1L, "2Y"));
    }
}
