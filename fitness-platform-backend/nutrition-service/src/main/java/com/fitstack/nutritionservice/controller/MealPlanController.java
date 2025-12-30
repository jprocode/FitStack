package com.fitstack.nutritionservice.controller;

import com.fitstack.nutritionservice.config.JwtUtil;
import com.fitstack.nutritionservice.dto.GenerateMealPlanRequest;
import com.fitstack.nutritionservice.dto.MealPlanDto;
import com.fitstack.nutritionservice.service.MealPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nutrition/meal-plans")
@RequiredArgsConstructor
@Slf4j
public class MealPlanController {

    private final MealPlanService mealPlanService;
    private final JwtUtil jwtUtil;

    @PostMapping("/generate")
    public ResponseEntity<MealPlanDto> generateMealPlan(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody GenerateMealPlanRequest request) {
        Long userId = extractUserId(authHeader);
        log.info("Generating meal plan for user {}", userId);
        MealPlanDto mealPlan = mealPlanService.generateMealPlan(userId, request);
        return ResponseEntity.ok(mealPlan);
    }

    @GetMapping
    public ResponseEntity<List<MealPlanDto>> getMealPlans(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        log.info("Getting meal plans for user {}", userId);
        List<MealPlanDto> mealPlans = mealPlanService.getMealPlansByUserId(userId);
        return ResponseEntity.ok(mealPlans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MealPlanDto> getMealPlanById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long userId = extractUserId(authHeader);
        log.info("Getting meal plan {} for user {}", id, userId);
        MealPlanDto mealPlan = mealPlanService.getMealPlanById(id, userId);
        return ResponseEntity.ok(mealPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMealPlan(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long userId = extractUserId(authHeader);
        log.info("Deleting meal plan {} for user {}", id, userId);
        mealPlanService.deleteMealPlan(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid authorization header");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}

