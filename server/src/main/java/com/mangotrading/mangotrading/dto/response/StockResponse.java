package com.mangotrading.mangotrading.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockResponse {
    private Long id;
    private String name;
    private String symbol;
    private String description;
    private String sector;
    private BigDecimal currentPrice;
    private BigDecimal volatility;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
