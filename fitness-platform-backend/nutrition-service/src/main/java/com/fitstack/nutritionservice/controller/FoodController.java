package com.fitstack.nutritionservice.controller;

import com.fitstack.nutritionservice.dto.FoodDto;
import com.fitstack.nutritionservice.dto.FoodSearchResponse;
import com.fitstack.nutritionservice.service.FoodService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nutrition/foods")
@RequiredArgsConstructor
@Slf4j
public class FoodController {

    private final FoodService foodService;

    @GetMapping("/search")
    public ResponseEntity<FoodSearchResponse> searchFoods(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {
        log.info("Searching foods with query: {}, limit: {}", query, limit);
        FoodSearchResponse response = foodService.searchFoods(query, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodDto> getFoodById(@PathVariable Long id) {
        log.info("Getting food by id: {}", id);
        FoodDto food = foodService.getFoodById(id);
        return ResponseEntity.ok(food);
    }

    @GetMapping("/fdc/{fdcId}")
    public ResponseEntity<FoodDto> getFoodByFdcId(@PathVariable Integer fdcId) {
        log.info("Getting food by fdcId: {}", fdcId);
        FoodDto food = foodService.getFoodByFdcId(fdcId);
        return ResponseEntity.ok(food);
    }
}

