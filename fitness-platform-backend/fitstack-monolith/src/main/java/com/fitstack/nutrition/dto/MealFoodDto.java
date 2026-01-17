package com.fitstack.nutrition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealFoodDto {
    private Long id;
    private Long foodId;
    private FoodDto food;
    private BigDecimal servings;
}

