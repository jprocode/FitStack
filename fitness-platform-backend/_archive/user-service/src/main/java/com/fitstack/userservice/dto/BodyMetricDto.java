package com.fitstack.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMetricDto {

    private Long id;
    private Long userId;
    private BigDecimal weightKg;
    private BigDecimal bodyFatPct;
    private LocalDate measurementDate;
    private String notes;

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

    private LocalDateTime createdAt;
}
