package com.mangotrading.mangotrading.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String symbol;

    private String description;

    private String sector;

    @NotNull
    private BigDecimal currentPrice;

    private BigDecimal volatility;

    private Boolean active;
}
