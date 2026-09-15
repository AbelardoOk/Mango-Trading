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
public class RankingResponse {
    private Integer position;
    private Long userId;
    private String userName;
    private BigDecimal balance;
    private BigDecimal stockValue;
    private BigDecimal totalPatrimony;
}
