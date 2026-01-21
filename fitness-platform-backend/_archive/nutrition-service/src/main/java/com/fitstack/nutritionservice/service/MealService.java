package com.fitstack.nutritionservice.service;

import com.fitstack.nutritionservice.dto.*;
import com.fitstack.nutritionservice.entity.Food;
import com.fitstack.nutritionservice.entity.Meal;
import com.fitstack.nutritionservice.entity.MealFood;
import com.fitstack.nutritionservice.exception.ResourceNotFoundException;
import com.fitstack.nutritionservice.repository.FoodRepository;
import com.fitstack.nutritionservice.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MealService {

    private final MealRepository mealRepository;
    private final FoodRepository foodRepository;

    @Transactional
    public MealDto createMeal(Long userId, CreateMealRequest request) {
        log.info("Creating meal for user {} on date {}", userId, request.getDate());

        Meal meal = Meal.builder()
                .userId(userId)
                .mealType(request.getMealType())
                .name(request.getName() != null ? request.getName() : request.getMealType().name())
                .date(request.getDate())
                .notes(request.getNotes())
                .mealFoods(new ArrayList<>())
                .build();

        for (CreateMealRequest.MealFoodItem item : request.getFoods()) {
            Food food = foodRepository.findById(item.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food not found with id: " + item.getFoodId()));

            MealFood mealFood = MealFood.builder()
                    .meal(meal)
                    .food(food)
                    .servings(item.getServings())
                    .build();
            meal.getMealFoods().add(mealFood);
        }

        Meal saved = mealRepository.save(meal);
        return toDto(saved);
    }

    public List<MealDto> getMealsByUserId(Long userId) {
        List<Meal> meals = mealRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId);
        return meals.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MealDto> getMealsByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Meal> meals = mealRepository.findByUserIdAndDateRange(userId, startDate, endDate);
        return meals.stream().map(this::toDto).collect(Collectors.toList());
    }

    public DailyMacrosResponse getTodaysMeals(Long userId) {
        return getDailyMacros(userId, LocalDate.now());
    }

    public DailyMacrosResponse getDailyMacros(Long userId, LocalDate date) {
        List<Meal> meals = mealRepository.findByUserIdAndDateWithFoods(userId, date);
        List<MealDto> mealDtos = meals.stream().map(this::toDto).collect(Collectors.toList());

        BigDecimal totalCalories = BigDecimal.ZERO;
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;

        for (MealDto meal : mealDtos) {
            if (meal.getTotalCalories() != null) {
                totalCalories = totalCalories.add(meal.getTotalCalories());
            }
            if (meal.getTotalProtein() != null) {
                totalProtein = totalProtein.add(meal.getTotalProtein());
            }
            if (meal.getTotalCarbs() != null) {
                totalCarbs = totalCarbs.add(meal.getTotalCarbs());
            }
            if (meal.getTotalFat() != null) {
                totalFat = totalFat.add(meal.getTotalFat());
            }
        }

        return DailyMacrosResponse.builder()
                .date(date)
                .totalCalories(totalCalories.setScale(2, RoundingMode.HALF_UP))
                .totalProtein(totalProtein.setScale(2, RoundingMode.HALF_UP))
                .totalCarbs(totalCarbs.setScale(2, RoundingMode.HALF_UP))
                .totalFat(totalFat.setScale(2, RoundingMode.HALF_UP))
                .meals(mealDtos)
                .mealCount(mealDtos.size())
                .build();
    }

    public MealDto getMealById(Long id, Long userId) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal not found with id: " + id));

        if (!meal.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Meal not found with id: " + id);
        }

        return toDto(meal);
    }

    @Transactional
    public void deleteMeal(Long id, Long userId) {
        if (!mealRepository.existsByIdAndUserId(id, userId)) {
            throw new ResourceNotFoundException("Meal not found with id: " + id);
        }
        mealRepository.deleteById(id);
        log.info("Deleted meal {} for user {}", id, userId);
    }

    private MealDto toDto(Meal meal) {
        List<MealFoodDto> foodDtos = meal.getMealFoods().stream()
                .map(this::toMealFoodDto)
                .collect(Collectors.toList());

        BigDecimal totalCalories = BigDecimal.ZERO;
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;

        for (MealFood mf : meal.getMealFoods()) {
            BigDecimal servings = mf.getServings() != null ? mf.getServings() : BigDecimal.ONE;
            Food food = mf.getFood();

            if (food.getCalories() != null) {
                totalCalories = totalCalories.add(food.getCalories().multiply(servings));
            }
            if (food.getProteinG() != null) {
                totalProtein = totalProtein.add(food.getProteinG().multiply(servings));
            }
            if (food.getCarbsG() != null) {
                totalCarbs = totalCarbs.add(food.getCarbsG().multiply(servings));
            }
            if (food.getFatG() != null) {
                totalFat = totalFat.add(food.getFatG().multiply(servings));
            }
        }

        return MealDto.builder()
                .id(meal.getId())
                .userId(meal.getUserId())
                .mealPlanId(meal.getMealPlanId())
                .mealType(meal.getMealType())
                .name(meal.getName())
                .date(meal.getDate())
                .notes(meal.getNotes())
                .createdAt(meal.getCreatedAt())
                .foods(foodDtos)
                .totalCalories(totalCalories.setScale(2, RoundingMode.HALF_UP))
                .totalProtein(totalProtein.setScale(2, RoundingMode.HALF_UP))
                .totalCarbs(totalCarbs.setScale(2, RoundingMode.HALF_UP))
                .totalFat(totalFat.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private MealFoodDto toMealFoodDto(MealFood mealFood) {
        return MealFoodDto.builder()
                .id(mealFood.getId())
                .foodId(mealFood.getFood().getId())
                .food(toFoodDto(mealFood.getFood()))
                .servings(mealFood.getServings())
                .build();
    }

    private FoodDto toFoodDto(Food food) {
        return FoodDto.builder()
                .id(food.getId())
                .fdcId(food.getFdcId())
                .name(food.getName())
                .calories(food.getCalories())
                .proteinG(food.getProteinG())
                .carbsG(food.getCarbsG())
                .fatG(food.getFatG())
                .servingSize(food.getServingSize())
                .build();
    }
}

