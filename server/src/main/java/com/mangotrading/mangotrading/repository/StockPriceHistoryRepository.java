package com.mangotrading.mangotrading.repository;

import com.mangotrading.mangotrading.entity.StockPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockPriceHistoryRepository extends JpaRepository<StockPriceHistory, Long> {

    List<StockPriceHistory> findByStockIdOrderByCreatedAtDesc(Long stockId);

    List<StockPriceHistory> findTop20ByStockIdOrderByCreatedAtDesc(Long stockId);

    List<StockPriceHistory> findTop2ByStockIdOrderByCreatedAtDesc(Long stockId);

    List<StockPriceHistory> findByStockIdAndCreatedAtAfterOrderByCreatedAtAsc(Long stockId, LocalDateTime from);

    List<StockPriceHistory> findByStockIdAndCreatedAtBetweenOrderByCreatedAtAsc(
            Long stockId, LocalDateTime from, LocalDateTime to);

    Optional<StockPriceHistory> findTopByStockIdAndCreatedAtLessThanEqualOrderByCreatedAtDesc(
            Long stockId, LocalDateTime at);
}
