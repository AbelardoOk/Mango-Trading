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
public class TransactionResponse {
    private Long id;
    private Long userId;
    private Long stockId;
    private String stockSymbol;
    private String stockName;
    private String type;
    private Integer quantity;
    private BigDecimal price;
    private LocalDateTime createdAt;
}
