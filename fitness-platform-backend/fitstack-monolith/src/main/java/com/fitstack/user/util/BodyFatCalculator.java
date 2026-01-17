package com.fitstack.user.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class BodyFatCalculator {

    public static BigDecimal calculateMaleBodyFat(BigDecimal heightCm, BigDecimal neckCm, BigDecimal waistCm) {
        if (heightCm == null || neckCm == null || waistCm == null) {
            return null;
        }

        // US Navy Formula for Men:
        // 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) -
        // 450

        double waist = waistCm.doubleValue();
        double neck = neckCm.doubleValue();
        double height = heightCm.doubleValue();

        if (waist - neck <= 0) {
            return null; // Invalid measurements
        }

        double logWaistNeck = Math.log10(waist - neck);
        double logHeight = Math.log10(height);

        double bodyFat = 495.0 / (1.0324 - 0.19077 * logWaistNeck + 0.15456 * logHeight) - 450.0;

        return BigDecimal.valueOf(bodyFat).setScale(1, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateFemaleBodyFat(BigDecimal heightCm, BigDecimal neckCm, BigDecimal waistCm,
            BigDecimal hipsCm) {
        if (heightCm == null || neckCm == null || waistCm == null || hipsCm == null) {
            return null;
        }

        // US Navy Formula for Women:
        // 495 / (1.29579 - 0.35004 * log10(waist + hips - neck) + 0.22100 *
        // log10(height)) - 450

        double waist = waistCm.doubleValue();
        double hips = hipsCm.doubleValue();
        double neck = neckCm.doubleValue();
        double height = heightCm.doubleValue();

        if (waist + hips - neck <= 0) {
            return null; // Invalid measurements
        }

        double logWaistHipsNeck = Math.log10(waist + hips - neck);
        double logHeight = Math.log10(height);

        double bodyFat = 495.0 / (1.29579 - 0.35004 * logWaistHipsNeck + 0.22100 * logHeight) - 450.0;

        return BigDecimal.valueOf(bodyFat).setScale(1, RoundingMode.HALF_UP);
    }
}
