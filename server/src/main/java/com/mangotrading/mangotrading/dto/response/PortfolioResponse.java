package com.mangotrading.mangotrading.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioResponse {
    private Long portfolioId;
    private Long userId;
    private String userName;
    private BigDecimal balance;
    private List<PortfolioItemResponse> items;
    private BigDecimal totalInvested;
    private BigDecimal totalCurrentValue;
    private BigDecimal totalPatrimony;
    private BigDecimal totalProfitLoss;
}
