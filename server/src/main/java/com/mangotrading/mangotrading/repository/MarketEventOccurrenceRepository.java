package com.mangotrading.mangotrading.repository;

import com.mangotrading.mangotrading.entity.MarketEventOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketEventOccurrenceRepository extends JpaRepository<MarketEventOccurrence, Long> {
    List<MarketEventOccurrence> findByEventIdOrderByExecutedAtDesc(Long eventId);
    List<MarketEventOccurrence> findTop20ByOrderByExecutedAtDesc();
}
