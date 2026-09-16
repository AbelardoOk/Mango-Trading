package com.mangotrading.mangotrading.entity;

import com.mangotrading.mangotrading.entity.enums.EventDirection;
import com.mangotrading.mangotrading.entity.enums.EventScope;
import com.mangotrading.mangotrading.entity.enums.MarketImpact;
import com.mangotrading.mangotrading.entity.enums.RecurrenceType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "market_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MarketImpact impact = MarketImpact.MEDIUM;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Strategic scheduling fields
    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type", length = 20)
    @Builder.Default
    private RecurrenceType recurrenceType = RecurrenceType.NONE;

    @Column(name = "daily_time")
    private LocalTime dailyTime;

    @Column(name = "random_min_minutes")
    private Integer randomMinMinutes;

    @Column(name = "random_max_minutes")
    private Integer randomMaxMinutes;

    @Column(name = "duration_minutes")
    @Builder.Default
    private Integer durationMinutes = 60;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", length = 20)
    @Builder.Default
    private EventScope scope = EventScope.ALL;

    @Column(name = "sector")
    private String sector;

    @Column(name = "price_delta_percent", precision = 10, scale = 4)
    private BigDecimal priceDeltaPercent;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", length = 20)
    @Builder.Default
    private EventDirection direction = EventDirection.RANDOM;

    @Column(name = "enabled")
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "next_run_at")
    private LocalDateTime nextRunAt;

    @Column(name = "last_run_at")
    private LocalDateTime lastRunAt;

    @Column(name = "visibility_minutes")
    @Builder.Default
    private Integer visibilityMinutes = 3;

    @Column(name = "days_of_week", length = 100)
    @Builder.Default
    private String daysOfWeek = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY";

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.impact == null) {
            this.impact = MarketImpact.MEDIUM;
        }
        if (this.recurrenceType == null) this.recurrenceType = RecurrenceType.NONE;
        if (this.scope == null) this.scope = EventScope.ALL;
        if (this.direction == null) this.direction = EventDirection.RANDOM;
        if (this.enabled == null) this.enabled = true;
        if (this.durationMinutes == null) this.durationMinutes = 60;
        if (this.visibilityMinutes == null) this.visibilityMinutes = 3;
        if (this.daysOfWeek == null) this.daysOfWeek = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY";
    }
}
