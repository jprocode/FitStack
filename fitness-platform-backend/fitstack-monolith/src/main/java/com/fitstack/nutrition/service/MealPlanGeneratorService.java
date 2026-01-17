package com.fitstack.nutrition.service;

import com.fitstack.nutrition.dto.GenerateMealPlanRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MealPlanGeneratorService {

    private final OpenAiClient openAiClient;

    private static final String SYSTEM_PROMPT = """
            You are a professional nutritionist and meal planning expert. Your task is to create detailed, 
            practical meal plans that meet specific nutritional targets. 
            
            Guidelines:
            - Create realistic, easy-to-prepare meals
            - Include a variety of foods for balanced nutrition
            - Consider meal timing and portion sizes
            - Provide specific quantities (in grams or common measurements)
            - Include macro breakdowns for each meal
            - Make meals practical for meal prep
            - Suggest alternatives when possible
            
            Format your response as a structured meal plan with clear sections for:
            - Breakfast
            - Lunch  
            - Dinner
            - Snacks (if needed)
            
            End with a shopping list organized by category (proteins, vegetables, fruits, grains, dairy, other).
            """;

    public String generateMealPlan(GenerateMealPlanRequest request) {
        log.info("Generating meal plan with targets: {} cal, {}g protein, {}g carbs, {}g fat",
                request.getTargetCalories(), request.getTargetProtein(),
                request.getTargetCarbs(), request.getTargetFat());

        String userPrompt = buildUserPrompt(request);
        return openAiClient.generateCompletion(SYSTEM_PROMPT, userPrompt);
    }

    private String buildUserPrompt(GenerateMealPlanRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Please create a detailed daily meal plan with the following nutritional targets:\n\n");
        prompt.append(String.format("- Total Calories: %.0f kcal\n", request.getTargetCalories()));
        prompt.append(String.format("- Protein: %.0fg\n", request.getTargetProtein()));
        prompt.append(String.format("- Carbohydrates: %.0fg\n", request.getTargetCarbs()));
        prompt.append(String.format("- Fat: %.0fg\n", request.getTargetFat()));

        List<String> prefs = request.getDietaryPrefs();
        if (prefs != null && !prefs.isEmpty()) {
            prompt.append("\nDietary preferences/restrictions:\n");
            for (String pref : prefs) {
                prompt.append("- ").append(pref).append("\n");
            }
        }

        prompt.append("\nPlease provide:\n");
        prompt.append("1. A complete daily meal plan with specific foods and portions\n");
        prompt.append("2. Macro breakdown for each meal (calories, protein, carbs, fat)\n");
        prompt.append("3. Total daily macros summary\n");
        prompt.append("4. A categorized shopping list\n");
        prompt.append("5. Any meal prep tips\n");

        return prompt.toString();
    }
}

