package com.fitstack.nutritionservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "target_calories", precision = 7, scale = 2)
    private BigDecimal targetCalories;

    @Column(name = "target_protein", precision = 6, scale = 2)
    private BigDecimal targetProtein;

    @Column(name = "target_carbs", precision = 6, scale = 2)
    private BigDecimal targetCarbs;

    @Column(name = "target_fat", precision = 6, scale = 2)
    private BigDecimal targetFat;

    @Column(name = "dietary_prefs", columnDefinition = "TEXT")
    private String dietaryPrefs;

    @Column(name = "generated_plan", columnDefinition = "TEXT")
    private String generatedPlan;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

