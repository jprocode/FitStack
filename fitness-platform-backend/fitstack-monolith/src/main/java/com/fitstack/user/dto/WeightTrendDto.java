package com.fitstack.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeightTrendDto {
    private LocalDate date;
    private BigDecimal weightKg;
    private BigDecimal movingAverage;
    private BigDecimal rateOfChange; // kg per week
    private BigDecimal bodyFatPct;

    // Extended Metrics
    private BigDecimal neckCm;
    private BigDecimal shouldersCm;
    private BigDecimal chestCm;
    private BigDecimal waistCm;
    private BigDecimal hipsCm;
    private BigDecimal leftBicepCm;
    private BigDecimal rightBicepCm;
    private BigDecimal leftThighCm;
    private BigDecimal rightThighCm;
    private BigDecimal leftCalfCm;
    private BigDecimal rightCalfCm;
}
