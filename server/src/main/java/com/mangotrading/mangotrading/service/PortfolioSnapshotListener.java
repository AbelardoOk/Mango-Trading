package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.event.TradeExecutedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class PortfolioSnapshotListener {

    private final PortfolioHistoryService portfolioHistoryService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onTradeExecuted(TradeExecutedEvent event) {
        portfolioHistoryService.captureAndBroadcast(event.userId());
    }
}
