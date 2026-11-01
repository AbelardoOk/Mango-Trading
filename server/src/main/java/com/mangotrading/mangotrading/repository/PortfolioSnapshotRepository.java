package com.mangotrading.mangotrading.repository;

import com.mangotrading.mangotrading.entity.PortfolioSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, Long> {

    List<PortfolioSnapshot> findByUserIdAndCapturedAtBetweenOrderByCapturedAtAsc(
            Long userId, LocalDateTime from, LocalDateTime to);

    Optional<PortfolioSnapshot> findTopByUserIdOrderByCapturedAtDesc(Long userId);

    long deleteByCapturedAtBefore(LocalDateTime cutoff);
}
