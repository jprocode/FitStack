package com.fitstack.userservice.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calorie calculator using the Mifflin-St Jeor BMR formula.
 * 
 * BMR (Basal Metabolic Rate):
 * - Male: (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) + 5
 * - Female: (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) −
 * 161
 */
public class CalorieCalculator {

    // Activity level multipliers for TDEE
    public static final BigDecimal SEDENTARY = new BigDecimal("1.2"); // Little/no exercise
    public static final BigDecimal LIGHT = new BigDecimal("1.375"); // 1-3 days/week
    public static final BigDecimal MODERATE = new BigDecimal("1.55"); // 3-5 days/week
    public static final BigDecimal ACTIVE = new BigDecimal("1.725"); // 6-7 days/week
    public static final BigDecimal VERY_ACTIVE = new BigDecimal("1.9"); // Twice daily

    /**
     * Calculate BMR using Mifflin-St Jeor formula.
     *
     * @param weightKg Weight in kilograms
     * @param heightCm Height in centimeters
     * @param ageYears Age in years
     * @param gender   "MALE", "MAN", "FEMALE", or "WOMAN"
     * @return BMR in calories, or null if inputs are invalid
     */
    public static BigDecimal calculateBMR(BigDecimal weightKg, BigDecimal heightCm, int ageYears, String gender) {
        if (weightKg == null || heightCm == null || ageYears <= 0 || gender == null) {
            return null;
        }

        // (10 × weight) + (6.25 × height) − (5 × age)
        BigDecimal base = weightKg.multiply(BigDecimal.TEN)
                .add(heightCm.multiply(new BigDecimal("6.25")))
                .subtract(new BigDecimal(ageYears * 5));

        // Gender-specific adjustment
        if ("MALE".equalsIgnoreCase(gender) || "MAN".equalsIgnoreCase(gender)) {
            return base.add(BigDecimal.valueOf(5)).setScale(0, RoundingMode.HALF_UP);
        } else if ("FEMALE".equalsIgnoreCase(gender) || "WOMAN".equalsIgnoreCase(gender)) {
            return base.subtract(BigDecimal.valueOf(161)).setScale(0, RoundingMode.HALF_UP);
        }

        return null;
    }

    /**
     * Calculate TDEE (Total Daily Energy Expenditure).
     *
     * @param bmr           Basal Metabolic Rate
     * @param activityLevel Activity level string
     * @return TDEE in calories
     */
    public static BigDecimal calculateTDEE(BigDecimal bmr, String activityLevel) {
        if (bmr == null) {
            return null;
        }

        BigDecimal multiplier = getActivityMultiplier(activityLevel);
        return bmr.multiply(multiplier).setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * Get activity level multiplier from string.
     */
    public static BigDecimal getActivityMultiplier(String activityLevel) {
        if (activityLevel == null) {
            return SEDENTARY;
        }

        return switch (activityLevel.toUpperCase()) {
            case "SEDENTARY" -> SEDENTARY;
            case "LIGHT", "LIGHTLY_ACTIVE" -> LIGHT;
            case "MODERATE", "MODERATELY_ACTIVE" -> MODERATE;
            case "ACTIVE", "VERY_ACTIVE" -> ACTIVE;
            case "EXTRA_ACTIVE", "EXTREMELY_ACTIVE" -> VERY_ACTIVE;
            default -> SEDENTARY;
        };
    }

    /**
     * Calculate calorie target for weight loss (~0.5kg/week).
     */
    public static BigDecimal calculateWeightLossTarget(BigDecimal tdee) {
        if (tdee == null)
            return null;
        return tdee.subtract(BigDecimal.valueOf(500)).setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * Calculate calorie target for muscle gain.
     */
    public static BigDecimal calculateMuscleGainTarget(BigDecimal tdee) {
        if (tdee == null)
            return null;
        return tdee.add(BigDecimal.valueOf(300)).setScale(0, RoundingMode.HALF_UP);
    }
}
