package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.response.PortfolioItemResponse;
import com.mangotrading.mangotrading.dto.response.PortfolioResponse;
import com.mangotrading.mangotrading.entity.Portfolio;
import com.mangotrading.mangotrading.entity.PortfolioItem;
import com.mangotrading.mangotrading.entity.User;
import com.mangotrading.mangotrading.exception.ResourceNotFoundException;
import com.mangotrading.mangotrading.repository.PortfolioItemRepository;
import com.mangotrading.mangotrading.repository.PortfolioRepository;
import com.mangotrading.mangotrading.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolioByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userId));

        Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada para usuário: " + userId));

        List<PortfolioItem> items = portfolioItemRepository.findByPortfolioId(portfolio.getId());

        List<PortfolioItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;

        for (PortfolioItemResponse ir : itemResponses) {
            totalInvested = totalInvested.add(ir.getTotalInvested());
            totalCurrentValue = totalCurrentValue.add(ir.getCurrentValue());
        }

        BigDecimal totalPatrimony = user.getBalance().add(totalCurrentValue);
        BigDecimal totalProfitLoss = totalCurrentValue.subtract(totalInvested);

        return PortfolioResponse.builder()
                .portfolioId(portfolio.getId())
                .userId(user.getId())
                .userName(user.getName())
                .balance(user.getBalance())
                .items(itemResponses)
                .totalInvested(totalInvested)
                .totalCurrentValue(totalCurrentValue)
                .totalPatrimony(totalPatrimony)
                .totalProfitLoss(totalProfitLoss)
                .build();
    }

    @Transactional(readOnly = true)
    public BigDecimal calculatePatrimony(Long userId) {
        return getPortfolioByUserId(userId).getTotalPatrimony();
    }

    private PortfolioItemResponse toItemResponse(PortfolioItem item) {
        BigDecimal currentPrice = item.getStock().getCurrentPrice();
        BigDecimal averagePrice = item.getAveragePrice();
        int quantity = item.getQuantity();

        BigDecimal totalInvested = averagePrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal currentValue = currentPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal profitLoss = currentValue.subtract(totalInvested);
        BigDecimal profitLossPercent = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) != 0) {
            profitLossPercent = profitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        }

        return PortfolioItemResponse.builder()
                .id(item.getId())
                .stockId(item.getStock().getId())
                .stockSymbol(item.getStock().getSymbol())
                .stockName(item.getStock().getName())
                .sector(item.getStock().getSector())
                .currentPrice(currentPrice)
                .quantity(quantity)
                .averagePrice(averagePrice)
                .totalInvested(totalInvested)
                .currentValue(currentValue)
                .profitLoss(profitLoss)
                .profitLossPercent(profitLossPercent)
                .build();
    }
}
