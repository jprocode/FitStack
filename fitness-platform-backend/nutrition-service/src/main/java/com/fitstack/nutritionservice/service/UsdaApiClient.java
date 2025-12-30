package com.fitstack.nutritionservice.service;

import com.fitstack.nutritionservice.dto.FoodDto;
import com.fitstack.nutritionservice.dto.UsdaFoodResponse;
import com.fitstack.nutritionservice.exception.ExternalApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class UsdaApiClient {

    private final WebClient webClient;

    @Value("${usda.api.url}")
    private String apiUrl;

    @Value("${usda.api.key}")
    private String apiKey;

    // USDA Nutrient IDs
    private static final int ENERGY_KCAL = 1008;
    private static final int PROTEIN = 1003;
    private static final int CARBOHYDRATE = 1005;
    private static final int FAT = 1004;

    public UsdaApiClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public List<FoodDto> searchFoods(String query, int pageSize) {
        try {
            log.info("Searching USDA API for: {}", query);

            UsdaFoodResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(apiUrl + "/foods/search")
                            .queryParam("api_key", apiKey)
                            .queryParam("query", query)
                            .queryParam("pageSize", pageSize)
                            .queryParam("dataType", "Foundation,SR Legacy,Branded")
                            .build())
                    .retrieve()
                    .bodyToMono(UsdaFoodResponse.class)
                    .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1)))
                    .block(Duration.ofSeconds(30));

            if (response == null || response.getFoods() == null) {
                return new ArrayList<>();
            }

            log.info("Found {} foods from USDA API", response.getFoods().size());
            return mapToFoodDtos(response.getFoods());

        } catch (WebClientResponseException e) {
            log.error("USDA API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ExternalApiException("Failed to search foods from USDA API: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error searching USDA API: {}", e.getMessage(), e);
            throw new ExternalApiException("Failed to search foods from USDA API", e);
        }
    }

    private List<FoodDto> mapToFoodDtos(List<UsdaFoodResponse.UsdaFood> usdaFoods) {
        List<FoodDto> foods = new ArrayList<>();

        for (UsdaFoodResponse.UsdaFood usdaFood : usdaFoods) {
            FoodDto dto = FoodDto.builder()
                    .fdcId(usdaFood.getFdcId())
                    .name(usdaFood.getDescription())
                    .calories(extractNutrient(usdaFood, ENERGY_KCAL))
                    .proteinG(extractNutrient(usdaFood, PROTEIN))
                    .carbsG(extractNutrient(usdaFood, CARBOHYDRATE))
                    .fatG(extractNutrient(usdaFood, FAT))
                    .servingSize(formatServingSize(usdaFood))
                    .build();
            foods.add(dto);
        }

        return foods;
    }

    private BigDecimal extractNutrient(UsdaFoodResponse.UsdaFood food, int nutrientId) {
        if (food.getFoodNutrients() == null) {
            return BigDecimal.ZERO;
        }

        return food.getFoodNutrients().stream()
                .filter(n -> n.getNutrientId() != null && n.getNutrientId() == nutrientId)
                .findFirst()
                .map(n -> n.getValue() != null ? BigDecimal.valueOf(n.getValue()) : BigDecimal.ZERO)
                .orElse(BigDecimal.ZERO);
    }

    private String formatServingSize(UsdaFoodResponse.UsdaFood food) {
        if (food.getServingSize() != null && food.getServingSizeUnit() != null) {
            return String.format("%.0f %s", food.getServingSize(), food.getServingSizeUnit());
        }
        return "100 g";
    }
}

