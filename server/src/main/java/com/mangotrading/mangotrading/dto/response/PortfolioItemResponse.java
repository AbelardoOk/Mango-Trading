package com.mangotrading.mangotrading.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioItemResponse {
    private Long id;
    private Long stockId;
    private String stockSymbol;
    private String stockName;
    private String sector;
    private BigDecimal currentPrice;
    private Integer quantity;
    private BigDecimal averagePrice;
    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private BigDecimal profitLossPercent;
}
