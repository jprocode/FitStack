package com.fitstack.nutrition.controller;

import com.fitstack.nutrition.dto.CreateCustomFoodRequest;
import com.fitstack.nutrition.dto.CustomFoodDto;
import com.fitstack.nutrition.service.CustomFoodService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nutrition/my-foods")
@RequiredArgsConstructor
@Slf4j
public class CustomFoodController {

    private final CustomFoodService customFoodService;

    @GetMapping
    public ResponseEntity<List<CustomFoodDto>> getMyFoods(HttpServletRequest request) {
        Long userId = getUserId(request);
        log.info("Getting custom foods for user: {}", userId);
        List<CustomFoodDto> foods = customFoodService.getUserFoods(userId);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/search")
    public ResponseEntity<List<CustomFoodDto>> searchMyFoods(
            HttpServletRequest request,
            @RequestParam("q") String query) {
        Long userId = getUserId(request);
        log.info("Searching custom foods for user: {} with query: {}", userId, query);
        List<CustomFoodDto> foods = customFoodService.searchUserFoods(userId, query);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomFoodDto> getById(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserId(request);
        CustomFoodDto food = customFoodService.getById(id, userId);
        return ResponseEntity.ok(food);
    }

    @PostMapping
    public ResponseEntity<CustomFoodDto> create(
            HttpServletRequest request,
            @Valid @RequestBody CreateCustomFoodRequest createRequest) {
        Long userId = getUserId(request);
        log.info("Creating custom food for user: {}", userId);
        CustomFoodDto created = customFoodService.create(userId, createRequest);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomFoodDto> update(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody CreateCustomFoodRequest updateRequest) {
        Long userId = getUserId(request);
        log.info("Updating custom food {} for user: {}", id, userId);
        CustomFoodDto updated = customFoodService.update(id, userId, updateRequest);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserId(request);
        log.info("Deleting custom food {} for user: {}", id, userId);
        customFoodService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }
}
