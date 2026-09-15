package com.mangotrading.mangotrading.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeRequest {

    @NotNull
    private Long stockId;

    @NotNull
    @Positive
    private Integer quantity;
}
