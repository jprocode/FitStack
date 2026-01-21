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
public class GoalProgressDto {
    private Long goalId;
    private String goalType;
    private BigDecimal currentValue;
    private BigDecimal targetValue;
    private BigDecimal startValue;
    private BigDecimal progressPercentage;
    private LocalDate predictedCompletionDate;
    private Integer daysRemaining;
    private LocalDate targetDate;
    private String status;
}

