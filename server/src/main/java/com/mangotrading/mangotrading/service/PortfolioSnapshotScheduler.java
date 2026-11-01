package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.repository.PortfolioRepository;
import com.mangotrading.mangotrading.repository.PortfolioSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class PortfolioSnapshotScheduler {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioSnapshotRepository snapshotRepository;
    private final PortfolioHistoryService portfolioHistoryService;

    @Value("${portfolio.snapshot.enabled:true}")
    private boolean enabled;

    @Value("${portfolio.snapshot.retention-days:90}")
    private int retentionDays;

    @Scheduled(fixedDelayString = "${portfolio.snapshot.delay-ms:60000}")
    public void captureAll() {
        if (!enabled) return;
        for (Long userId : portfolioRepository.findUserIdsWithItems()) {
            portfolioHistoryService.captureAndBroadcast(userId);
        }
        log.debug("PortfolioSnapshotScheduler: snapshots captured");
    }

    @Transactional
    @Scheduled(cron = "${portfolio.snapshot.cleanup-cron:0 0 3 * * *}")
    public void cleanup() {
        if (retentionDays <= 0) return;
        long removed = snapshotRepository.deleteByCapturedAtBefore(
                LocalDateTime.now().minusDays(retentionDays));
        log.info("PortfolioSnapshotScheduler: removed {} snapshots older than {} days",
                removed, retentionDays);
    }
}
