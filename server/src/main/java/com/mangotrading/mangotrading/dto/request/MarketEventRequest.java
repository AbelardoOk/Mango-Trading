package com.mangotrading.mangotrading.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketEventRequest {

    @NotBlank
    private String title;

    private String description;

    private String impact; // LOW, MEDIUM, HIGH

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    // Strategic fields
    private String recurrenceType; // NONE, DAILY, RANDOM
    private LocalTime dailyTime; // for DAILY e.g. 09:00
    private Integer randomMinMinutes;
    private Integer randomMaxMinutes;
    private String randomMin; // e.g. "30m" / "2h" — alternative to randomMinMinutes
    private String randomMax; // e.g. "2h"
    private Integer durationMinutes; // default 60
    private String scope; // ALL, SECTOR
    private String sector;
    private BigDecimal priceDeltaPercent; // custom, null => use impact
    private String direction; // POSITIVE, NEGATIVE, RANDOM
    private Boolean enabled;
    private Integer visibilityMinutes; // default 3
    private String daysOfWeek; // comma separated MONDAY,...
}
