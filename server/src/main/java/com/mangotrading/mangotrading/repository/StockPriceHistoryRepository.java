package com.mangotrading.mangotrading.repository;

import com.mangotrading.mangotrading.entity.StockPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockPriceHistoryRepository extends JpaRepository<StockPriceHistory, Long> {

    List<StockPriceHistory> findByStockIdOrderByCreatedAtDesc(Long stockId);

    List<StockPriceHistory> findTop20ByStockIdOrderByCreatedAtDesc(Long stockId);
}
