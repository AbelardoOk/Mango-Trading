package com.mangotrading.mangotrading.repository;

import com.mangotrading.mangotrading.entity.MarketEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MarketEventRepository extends JpaRepository<MarketEvent, Long> {

    List<MarketEvent> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

    List<MarketEvent> findAllByOrderByCreatedAtDesc();

    List<MarketEvent> findByEnabledTrueAndNextRunAtBefore(LocalDateTime now);

    List<MarketEvent> findByEnabledTrueAndNextRunAtBetween(LocalDateTime from, LocalDateTime to);

    List<MarketEvent> findByEnabledTrueAndNextRunAtIsNotNull();
}
