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
public class MetricsStatsDto {
    private BigDecimal averageWeight;
    private BigDecimal minWeight;
    private BigDecimal maxWeight;
    private BigDecimal weightChange; // total change over period
    private BigDecimal ratePerWeek; // average change per week
    private BigDecimal averageBodyFat;
    private BigDecimal bodyFatChange;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalEntries;
    private Integer weeksTracked;
}

