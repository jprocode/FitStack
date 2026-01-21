package com.fitstack.nutritionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodSearchResponse {
    private List<FoodDto> foods;
    private int totalResults;
    private String query;
}

