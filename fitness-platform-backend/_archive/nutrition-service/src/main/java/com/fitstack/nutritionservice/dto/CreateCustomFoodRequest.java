package com.fitstack.nutritionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomFoodRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String brand;

    @NotNull(message = "Calories is required")
    @Positive(message = "Calories must be positive")
    private BigDecimal calories;

    private BigDecimal proteinG;
    private BigDecimal carbsG;
    private BigDecimal fatG;
    private BigDecimal fiberG;

    private BigDecimal servingSize;
    private String servingUnit;
}
