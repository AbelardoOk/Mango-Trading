package com.mangotrading.mangotrading.repository;

import com.mangotrading.mangotrading.entity.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {

    List<PortfolioItem> findByPortfolioId(Long portfolioId);

    Optional<PortfolioItem> findByPortfolioIdAndStockId(Long portfolioId, Long stockId);

    boolean existsByPortfolioIdAndStockId(Long portfolioId, Long stockId);
}
