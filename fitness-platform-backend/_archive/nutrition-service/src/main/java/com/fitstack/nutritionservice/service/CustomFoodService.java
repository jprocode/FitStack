package com.fitstack.nutritionservice.service;

import com.fitstack.nutritionservice.dto.CreateCustomFoodRequest;
import com.fitstack.nutritionservice.dto.CustomFoodDto;
import com.fitstack.nutritionservice.entity.CustomFood;
import com.fitstack.nutritionservice.exception.ResourceNotFoundException;
import com.fitstack.nutritionservice.repository.CustomFoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomFoodService {

    private final CustomFoodRepository customFoodRepository;

    public List<CustomFoodDto> getUserFoods(Long userId) {
        log.info("Getting custom foods for user: {}", userId);
        return customFoodRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CustomFoodDto> searchUserFoods(Long userId, String query) {
        log.info("Searching custom foods for user: {} with query: {}", userId, query);
        return customFoodRepository.searchByUserIdAndName(userId, query)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CustomFoodDto getById(Long id, Long userId) {
        CustomFood food = customFoodRepository.findByIdAndUserId(id, userId);
        if (food == null) {
            throw new ResourceNotFoundException("Custom food not found with id: " + id);
        }
        return toDto(food);
    }

    @Transactional
    public CustomFoodDto create(Long userId, CreateCustomFoodRequest request) {
        log.info("Creating custom food for user: {}", userId);

        CustomFood food = CustomFood.builder()
                .userId(userId)
                .name(request.getName())
                .brand(request.getBrand())
                .calories(request.getCalories())
                .proteinG(request.getProteinG())
                .carbsG(request.getCarbsG())
                .fatG(request.getFatG())
                .fiberG(request.getFiberG())
                .servingSize(request.getServingSize())
                .servingUnit(request.getServingUnit())
                .build();

        CustomFood saved = customFoodRepository.save(food);
        log.info("Created custom food with id: {}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public CustomFoodDto update(Long id, Long userId, CreateCustomFoodRequest request) {
        log.info("Updating custom food {} for user: {}", id, userId);

        CustomFood food = customFoodRepository.findByIdAndUserId(id, userId);
        if (food == null) {
            throw new ResourceNotFoundException("Custom food not found with id: " + id);
        }

        food.setName(request.getName());
        food.setBrand(request.getBrand());
        food.setCalories(request.getCalories());
        food.setProteinG(request.getProteinG());
        food.setCarbsG(request.getCarbsG());
        food.setFatG(request.getFatG());
        food.setFiberG(request.getFiberG());
        food.setServingSize(request.getServingSize());
        food.setServingUnit(request.getServingUnit());

        CustomFood saved = customFoodRepository.save(food);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        log.info("Deleting custom food {} for user: {}", id, userId);

        if (!customFoodRepository.existsByIdAndUserId(id, userId)) {
            throw new ResourceNotFoundException("Custom food not found with id: " + id);
        }

        customFoodRepository.deleteById(id);
    }

    private CustomFoodDto toDto(CustomFood food) {
        return CustomFoodDto.builder()
                .id(food.getId())
                .userId(food.getUserId())
                .name(food.getName())
                .brand(food.getBrand())
                .calories(food.getCalories())
                .proteinG(food.getProteinG())
                .carbsG(food.getCarbsG())
                .fatG(food.getFatG())
                .fiberG(food.getFiberG())
                .servingSize(food.getServingSize())
                .servingUnit(food.getServingUnit())
                .createdAt(food.getCreatedAt())
                .updatedAt(food.getUpdatedAt())
                .isCustom(true)
                .build();
    }
}
