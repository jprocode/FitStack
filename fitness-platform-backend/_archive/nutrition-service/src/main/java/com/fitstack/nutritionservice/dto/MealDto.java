package com.fitstack.nutritionservice.dto;

import com.fitstack.nutritionservice.entity.Meal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealDto {
    private Long id;
    private Long userId;
    private Long mealPlanId;
    private Meal.MealType mealType;
    private String name;
    private LocalDate date;
    private String notes;
    private LocalDateTime createdAt;
    private List<MealFoodDto> foods;
    
    // Calculated totals
    private BigDecimal totalCalories;
    private BigDecimal totalProtein;
    private BigDecimal totalCarbs;
    private BigDecimal totalFat;
}

