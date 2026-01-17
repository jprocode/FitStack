package com.fitstack.nutrition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomFoodDto {
    private Long id;
    private Long userId;
    private String name;
    private String brand;
    private BigDecimal calories;
    private BigDecimal proteinG;
    private BigDecimal carbsG;
    private BigDecimal fatG;
    private BigDecimal fiberG;
    private BigDecimal servingSize;
    private String servingUnit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Flag to indicate this is a custom food (for frontend)
    private boolean isCustom = true;
}
