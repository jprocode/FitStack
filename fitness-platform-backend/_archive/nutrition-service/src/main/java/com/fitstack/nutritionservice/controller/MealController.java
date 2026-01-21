package com.fitstack.nutritionservice.controller;

import com.fitstack.nutritionservice.config.JwtUtil;
import com.fitstack.nutritionservice.dto.CreateMealRequest;
import com.fitstack.nutritionservice.dto.DailyMacrosResponse;
import com.fitstack.nutritionservice.dto.MealDto;
import com.fitstack.nutritionservice.service.MealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/nutrition/meals")
@RequiredArgsConstructor
@Slf4j
public class MealController {

    private final MealService mealService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<MealDto> createMeal(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateMealRequest request) {
        Long userId = extractUserId(authHeader);
        log.info("Creating meal for user {}", userId);
        MealDto meal = mealService.createMeal(userId, request);
        return ResponseEntity.ok(meal);
    }

    @GetMapping
    public ResponseEntity<List<MealDto>> getMeals(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = extractUserId(authHeader);
        log.info("Getting meals for user {}", userId);

        List<MealDto> meals;
        if (startDate != null && endDate != null) {
            meals = mealService.getMealsByUserIdAndDateRange(userId, startDate, endDate);
        } else {
            meals = mealService.getMealsByUserId(userId);
        }

        return ResponseEntity.ok(meals);
    }

    @GetMapping("/today")
    public ResponseEntity<DailyMacrosResponse> getTodaysMeals(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        log.info("Getting today's meals for user {}", userId);
        DailyMacrosResponse response = mealService.getTodaysMeals(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyMacrosResponse> getDailyMacros(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long userId = extractUserId(authHeader);
        log.info("Getting daily macros for user {} on date {}", userId, date);
        DailyMacrosResponse response = mealService.getDailyMacros(userId, date);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MealDto> getMealById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long userId = extractUserId(authHeader);
        log.info("Getting meal {} for user {}", id, userId);
        MealDto meal = mealService.getMealById(id, userId);
        return ResponseEntity.ok(meal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        Long userId = extractUserId(authHeader);
        log.info("Deleting meal {} for user {}", id, userId);
        mealService.deleteMeal(id, userId);
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

