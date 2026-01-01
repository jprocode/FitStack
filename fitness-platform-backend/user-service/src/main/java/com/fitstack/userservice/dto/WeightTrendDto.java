package com.fitstack.userservice.dto;

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
}

