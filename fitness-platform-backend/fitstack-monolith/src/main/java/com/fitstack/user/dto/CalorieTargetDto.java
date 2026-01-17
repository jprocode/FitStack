package com.fitstack.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalorieTargetDto {
    private BigDecimal bmr;
    private BigDecimal tdee;
    private BigDecimal maintenanceCalories;
    private BigDecimal weightLossCalories;
    private BigDecimal muscleGainCalories;
    private String activityLevel;
}
