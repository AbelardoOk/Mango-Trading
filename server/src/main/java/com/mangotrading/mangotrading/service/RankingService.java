package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.response.RankingResponse;
import com.mangotrading.mangotrading.entity.PortfolioItem;
import com.mangotrading.mangotrading.entity.User;
import com.mangotrading.mangotrading.repository.PortfolioItemRepository;
import com.mangotrading.mangotrading.repository.PortfolioRepository;
import com.mangotrading.mangotrading.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final PortfolioItemRepository portfolioItemRepository;

    @Transactional(readOnly = true)
    public List<RankingResponse> getRanking() {
        List<User> users = userRepository.findAll();
        List<RankingResponse> ranking = new ArrayList<>();

        for (User user : users) {
            BigDecimal stockValue = BigDecimal.ZERO;

            portfolioRepository.findByUserId(user.getId()).ifPresent(portfolio -> {
                List<PortfolioItem> items = portfolioItemRepository.findByPortfolioId(portfolio.getId());
                // será somado abaixo
            });

            // Recalcula com dados reais
            BigDecimal computedStockValue = portfolioRepository.findByUserId(user.getId())
                    .map(p -> portfolioItemRepository.findByPortfolioId(p.getId()))
                    .orElse(List.of())
                    .stream()
                    .map(item -> item.getStock().getCurrentPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            stockValue = computedStockValue;
            BigDecimal patrimony = user.getBalance().add(stockValue);

            ranking.add(RankingResponse.builder()
                    .userId(user.getId())
                    .userName(user.getName())
                    .balance(user.getBalance())
                    .stockValue(stockValue)
                    .totalPatrimony(patrimony)
                    .build());
        }

        ranking.sort(Comparator.comparing(RankingResponse::getTotalPatrimony).reversed());

        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).setPosition(i + 1);
        }

        return ranking;
    }
}
