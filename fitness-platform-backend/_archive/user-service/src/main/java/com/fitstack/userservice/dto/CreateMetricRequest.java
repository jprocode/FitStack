package com.fitstack.userservice.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
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
public class CreateMetricRequest {

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "20.0", message = "Weight must be at least 20 kg")
    @DecimalMax(value = "500.0", message = "Weight must be less than 500 kg")
    private BigDecimal weightKg;

    @DecimalMin(value = "1.0", message = "Body fat must be at least 1%")
    @DecimalMax(value = "70.0", message = "Body fat must be less than 70%")
    private BigDecimal bodyFatPct;

    @NotNull(message = "Measurement date is required")
    @PastOrPresent(message = "Measurement date cannot be in the future")
    private LocalDate measurementDate;

    private String notes;

    // Optional Extended Metrics (in cm)
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal neckCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "200.0")
    private BigDecimal shouldersCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "200.0")
    private BigDecimal chestCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "200.0")
    private BigDecimal waistCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "200.0")
    private BigDecimal hipsCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal leftBicepCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal rightBicepCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal leftThighCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal rightThighCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal leftCalfCm;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal rightCalfCm;
}
