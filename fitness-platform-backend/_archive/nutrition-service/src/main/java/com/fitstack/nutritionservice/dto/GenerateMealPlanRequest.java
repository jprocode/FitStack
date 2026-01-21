package com.fitstack.nutritionservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateMealPlanRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Target calories is required")
    @Min(value = 1000, message = "Target calories must be at least 1000")
    @Max(value = 5000, message = "Target calories must not exceed 5000")
    private BigDecimal targetCalories;

    @NotNull(message = "Target protein is required")
    @Min(value = 30, message = "Target protein must be at least 30g")
    private BigDecimal targetProtein;

    @NotNull(message = "Target carbs is required")
    @Min(value = 50, message = "Target carbs must be at least 50g")
    private BigDecimal targetCarbs;

    @NotNull(message = "Target fat is required")
    @Min(value = 20, message = "Target fat must be at least 20g")
    private BigDecimal targetFat;

    private List<String> dietaryPrefs;
}

