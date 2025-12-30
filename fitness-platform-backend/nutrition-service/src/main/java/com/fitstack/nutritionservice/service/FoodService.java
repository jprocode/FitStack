package com.fitstack.nutritionservice.service;

import com.fitstack.nutritionservice.dto.FoodDto;
import com.fitstack.nutritionservice.dto.FoodSearchResponse;
import com.fitstack.nutritionservice.entity.Food;
import com.fitstack.nutritionservice.exception.ResourceNotFoundException;
import com.fitstack.nutritionservice.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FoodService {

    private final FoodRepository foodRepository;
    private final UsdaApiClient usdaApiClient;

    public FoodSearchResponse searchFoods(String query, int limit) {
        log.info("Searching foods with query: {}", query);

        // First check local cache
        List<Food> cachedFoods = foodRepository.searchByName(query);

        if (!cachedFoods.isEmpty() && cachedFoods.size() >= limit) {
            log.info("Found {} foods in cache", cachedFoods.size());
            List<FoodDto> foodDtos = cachedFoods.stream()
                    .limit(limit)
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return FoodSearchResponse.builder()
                    .foods(foodDtos)
                    .totalResults(foodDtos.size())
                    .query(query)
                    .build();
        }

        // Search USDA API
        List<FoodDto> usdaFoods = usdaApiClient.searchFoods(query, limit);

        // Cache the results
        for (FoodDto foodDto : usdaFoods) {
            if (foodDto.getFdcId() != null && !foodRepository.existsByFdcId(foodDto.getFdcId())) {
                Food food = toEntity(foodDto);
                foodRepository.save(food);
                foodDto.setId(food.getId());
            }
        }

        return FoodSearchResponse.builder()
                .foods(usdaFoods)
                .totalResults(usdaFoods.size())
                .query(query)
                .build();
    }

    public FoodDto getFoodById(Long id) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food not found with id: " + id));
        return toDto(food);
    }

    public FoodDto getFoodByFdcId(Integer fdcId) {
        Food food = foodRepository.findByFdcId(fdcId)
                .orElseThrow(() -> new ResourceNotFoundException("Food not found with fdcId: " + fdcId));
        return toDto(food);
    }

    @Transactional
    public FoodDto saveFood(FoodDto foodDto) {
        Food food = toEntity(foodDto);
        Food saved = foodRepository.save(food);
        return toDto(saved);
    }

    private FoodDto toDto(Food food) {
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

    private Food toEntity(FoodDto dto) {
        return Food.builder()
                .fdcId(dto.getFdcId())
                .name(dto.getName())
                .calories(dto.getCalories())
                .proteinG(dto.getProteinG())
                .carbsG(dto.getCarbsG())
                .fatG(dto.getFatG())
                .servingSize(dto.getServingSize())
                .build();
    }
}

