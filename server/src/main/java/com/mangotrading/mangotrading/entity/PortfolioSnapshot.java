package com.mangotrading.mangotrading.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_snapshots", indexes = {
        @Index(name = "idx_portfolio_snapshot_user_captured", columnList = "user_id, captured_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    @NotNull
    @Column(name = "stock_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal stockValue;

    @NotNull
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal patrimony;

    @Column(name = "captured_at", nullable = false, updatable = false)
    private LocalDateTime capturedAt;

    @PrePersist
    protected void onCreate() {
        if (this.capturedAt == null) {
            this.capturedAt = LocalDateTime.now();
        }
    }
}
