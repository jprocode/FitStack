package com.fitstack.nutrition.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsdaFoodResponse {

    @JsonProperty("foods")
    private List<UsdaFood> foods;

    @JsonProperty("totalHits")
    private Integer totalHits;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UsdaFood {
        @JsonProperty("fdcId")
        private Integer fdcId;

        @JsonProperty("description")
        private String description;

        @JsonProperty("brandOwner")
        private String brandOwner;

        @JsonProperty("servingSize")
        private Double servingSize;

        @JsonProperty("servingSizeUnit")
        private String servingSizeUnit;

        @JsonProperty("foodNutrients")
        private List<FoodNutrient> foodNutrients;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FoodNutrient {
        @JsonProperty("nutrientId")
        private Integer nutrientId;

        @JsonProperty("nutrientName")
        private String nutrientName;

        @JsonProperty("value")
        private Double value;

        @JsonProperty("unitName")
        private String unitName;
    }
}

