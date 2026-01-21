package com.fitstack.nutritionservice.service;

import com.fitstack.nutritionservice.dto.GenerateMealPlanRequest;
import com.fitstack.nutritionservice.dto.MealPlanDto;
import com.fitstack.nutritionservice.entity.MealPlan;
import com.fitstack.nutritionservice.exception.ResourceNotFoundException;
import com.fitstack.nutritionservice.repository.MealPlanRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final MealPlanGeneratorService mealPlanGeneratorService;
    private final ObjectMapper objectMapper;

    @Transactional
    public MealPlanDto generateMealPlan(Long userId, GenerateMealPlanRequest request) {
        log.info("Generating meal plan for user {} with targets: {} cal", userId, request.getTargetCalories());

        // Generate the meal plan using AI
        String generatedPlan = mealPlanGeneratorService.generateMealPlan(request);

        // Save the meal plan
        MealPlan mealPlan = MealPlan.builder()
                .userId(userId)
                .name(request.getName())
                .targetCalories(request.getTargetCalories())
                .targetProtein(request.getTargetProtein())
                .targetCarbs(request.getTargetCarbs())
                .targetFat(request.getTargetFat())
                .dietaryPrefs(serializeList(request.getDietaryPrefs()))
                .generatedPlan(generatedPlan)
                .build();

        MealPlan saved = mealPlanRepository.save(mealPlan);
        log.info("Saved meal plan with id: {}", saved.getId());

        return toDto(saved);
    }

    public List<MealPlanDto> getMealPlansByUserId(Long userId) {
        List<MealPlan> mealPlans = mealPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return mealPlans.stream().map(this::toDto).collect(Collectors.toList());
    }

    public MealPlanDto getMealPlanById(Long id, Long userId) {
        MealPlan mealPlan = mealPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal plan not found with id: " + id));
        return toDto(mealPlan);
    }

    @Transactional
    public void deleteMealPlan(Long id, Long userId) {
        if (!mealPlanRepository.existsByIdAndUserId(id, userId)) {
            throw new ResourceNotFoundException("Meal plan not found with id: " + id);
        }
        mealPlanRepository.deleteById(id);
        log.info("Deleted meal plan {} for user {}", id, userId);
    }

    private MealPlanDto toDto(MealPlan mealPlan) {
        return MealPlanDto.builder()
                .id(mealPlan.getId())
                .userId(mealPlan.getUserId())
                .name(mealPlan.getName())
                .targetCalories(mealPlan.getTargetCalories())
                .targetProtein(mealPlan.getTargetProtein())
                .targetCarbs(mealPlan.getTargetCarbs())
                .targetFat(mealPlan.getTargetFat())
                .dietaryPrefs(deserializeList(mealPlan.getDietaryPrefs()))
                .generatedPlan(mealPlan.getGeneratedPlan())
                .createdAt(mealPlan.getCreatedAt())
                .build();
    }

    private String serializeList(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            log.error("Error serializing list: {}", e.getMessage());
            return String.join(",", list);
        }
    }

    private List<String> deserializeList(String json) {
        if (json == null || json.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (JsonProcessingException e) {
            log.error("Error deserializing list: {}", e.getMessage());
            return Arrays.asList(json.split(","));
        }
    }
}

