package com.fitstack.nutrition.dto;

import com.fitstack.nutrition.entity.Meal;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMealRequest {

    @NotNull(message = "Meal type is required")
    private Meal.MealType mealType;

    private String name;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String notes;

    @NotEmpty(message = "At least one food is required")
    private List<MealFoodItem> foods;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MealFoodItem {
        @NotNull(message = "Food ID is required")
        private Long foodId;

        @NotNull(message = "Servings is required")
        private BigDecimal servings;
    }
}

