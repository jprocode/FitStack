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
    private LocalDateTime createdAt;
}

