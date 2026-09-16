package com.mangotrading.mangotrading.dto.response;

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
public class MarketEventResponse {
    private Long id;
    private String title;
    private String description;
    private String impact;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;

    // Strategic fields
    private String recurrenceType;
    private LocalTime dailyTime;
    private Integer randomMinMinutes;
    private Integer randomMaxMinutes;
    private Integer durationMinutes;
    private String scope;
    private String sector;
    private BigDecimal priceDeltaPercent;
    private String direction;
    private Boolean enabled;
    private LocalDateTime nextRunAt;
    private LocalDateTime lastRunAt;
    private Integer visibilityMinutes;
    private String daysOfWeek;
    private String status; // SCHEDULED, UPCOMING, ACTIVE, ENDED (computed)
    private Long secondsToStart; // for UPCOMING countdown
}
