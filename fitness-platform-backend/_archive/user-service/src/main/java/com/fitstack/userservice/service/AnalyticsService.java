package com.fitstack.userservice.service;

import com.fitstack.userservice.dto.GoalProgressDto;
import com.fitstack.userservice.dto.MetricsStatsDto;
import com.fitstack.userservice.dto.WeightTrendDto;
import com.fitstack.userservice.entity.BodyMetric;
import com.fitstack.userservice.entity.Goal;
import com.fitstack.userservice.repository.BodyMetricRepository;
import com.fitstack.userservice.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final BodyMetricRepository bodyMetricRepository;
    private final GoalRepository goalRepository;

    /**
     * Get weight trend data with moving average calculation
     */
    public List<WeightTrendDto> getWeightTrend(Long userId, LocalDate startDate, LocalDate endDate) {
        List<BodyMetric> metrics = bodyMetricRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        if (metrics.isEmpty()) {
            return new ArrayList<>();
        }

        List<WeightTrendDto> trendData = new ArrayList<>();

        for (int i = 0; i < metrics.size(); i++) {
            BodyMetric metric = metrics.get(i);

            // Calculate 7-day moving average
            BigDecimal movingAverage = calculateMovingAverage(metrics, i, 7);

            // Calculate rate of change (kg per week)
            BigDecimal rateOfChange = calculateRateOfChange(metrics, i);

            trendData.add(WeightTrendDto.builder()
                    .date(metric.getMeasurementDate())
                    .weightKg(metric.getWeightKg())
                    .movingAverage(movingAverage)
                    .rateOfChange(rateOfChange)
                    .bodyFatPct(metric.getBodyFatPct())
                    // Extended Metrics
                    .neckCm(metric.getNeckCm())
                    .shouldersCm(metric.getShouldersCm())
                    .chestCm(metric.getChestCm())
                    .waistCm(metric.getWaistCm())
                    .hipsCm(metric.getHipsCm())
                    .leftBicepCm(metric.getLeftBicepCm())
                    .rightBicepCm(metric.getRightBicepCm())
                    .leftThighCm(metric.getLeftThighCm())
                    .rightThighCm(metric.getRightThighCm())
                    .leftCalfCm(metric.getLeftCalfCm())
                    .rightCalfCm(metric.getRightCalfCm())
                    .build());
        }

        return trendData;
    }

    /**
     * Calculate progress toward active goals
     */
    public List<GoalProgressDto> calculateGoalProgress(Long userId) {
        List<Goal> activeGoals = goalRepository.findByUserIdAndStatusOrderByCreatedAtDesc(
                userId, Goal.GoalStatus.ACTIVE);

        Optional<BodyMetric> latestMetric = bodyMetricRepository.findTopByUserIdOrderByMeasurementDateDesc(userId);
        Optional<BodyMetric> oldestMetric = bodyMetricRepository.findFirstByUserIdOrderByMeasurementDateAsc(userId);

        if (latestMetric.isEmpty()) {
            // Return goals without progress if no metrics
            return activeGoals.stream()
                    .map(goal -> GoalProgressDto.builder()
                            .goalId(goal.getId())
                            .goalType(goal.getGoalType().name())
                            .targetValue(goal.getTargetWeight())
                            .targetDate(goal.getTargetDate())
                            .status(goal.getStatus().name())
                            .progressPercentage(BigDecimal.ZERO)
                            .build())
                    .toList();
        }

        BigDecimal currentWeight = latestMetric.get().getWeightKg();
        BigDecimal startWeight = oldestMetric.map(BodyMetric::getWeightKg).orElse(currentWeight);

        List<GoalProgressDto> progressList = new ArrayList<>();

        for (Goal goal : activeGoals) {
            GoalProgressDto progress = calculateSingleGoalProgress(goal, currentWeight, startWeight);
            progressList.add(progress);
        }

        return progressList;
    }

    /**
     * Get aggregate statistics for a period
     */
    public MetricsStatsDto getMetricsStats(Long userId, String period) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = calculateStartDate(period);

        List<BodyMetric> metrics = bodyMetricRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        if (metrics.isEmpty()) {
            return MetricsStatsDto.builder()
                    .startDate(startDate)
                    .endDate(endDate)
                    .totalEntries(0)
                    .weeksTracked(0)
                    .build();
        }

        BigDecimal avgWeight = bodyMetricRepository.findAverageWeightByUserIdAndDateRange(userId, startDate, endDate);
        BigDecimal minWeight = bodyMetricRepository.findMinWeightByUserIdAndDateRange(userId, startDate, endDate);
        BigDecimal maxWeight = bodyMetricRepository.findMaxWeightByUserIdAndDateRange(userId, startDate, endDate);
        BigDecimal avgBodyFat = bodyMetricRepository.findAverageBodyFatByUserIdAndDateRange(userId, startDate, endDate);
        Long count = bodyMetricRepository.countByUserIdAndDateRange(userId, startDate, endDate);

        // Calculate weight change
        BodyMetric firstMetric = metrics.get(0);
        BodyMetric lastMetric = metrics.get(metrics.size() - 1);
        BigDecimal weightChange = lastMetric.getWeightKg() != null && firstMetric.getWeightKg() != null
                ? lastMetric.getWeightKg().subtract(firstMetric.getWeightKg())
                : null;

        // Calculate body fat change
        BigDecimal bodyFatChange = null;
        if (lastMetric.getBodyFatPct() != null && firstMetric.getBodyFatPct() != null) {
            bodyFatChange = lastMetric.getBodyFatPct().subtract(firstMetric.getBodyFatPct());
        }

        // Calculate weeks tracked
        long daysBetween = ChronoUnit.DAYS.between(firstMetric.getMeasurementDate(), lastMetric.getMeasurementDate());
        int weeksTracked = (int) Math.ceil(daysBetween / 7.0);

        // Calculate rate per week
        BigDecimal ratePerWeek = null;
        if (weightChange != null && weeksTracked > 0) {
            ratePerWeek = weightChange.divide(BigDecimal.valueOf(weeksTracked), 2, RoundingMode.HALF_UP);
        }

        return MetricsStatsDto.builder()
                .averageWeight(avgWeight != null ? avgWeight.setScale(2, RoundingMode.HALF_UP) : null)
                .minWeight(minWeight)
                .maxWeight(maxWeight)
                .weightChange(weightChange)
                .ratePerWeek(ratePerWeek)
                .averageBodyFat(avgBodyFat != null ? avgBodyFat.setScale(2, RoundingMode.HALF_UP) : null)
                .bodyFatChange(bodyFatChange)
                .startDate(firstMetric.getMeasurementDate())
                .endDate(lastMetric.getMeasurementDate())
                .totalEntries(count.intValue())
                .weeksTracked(Math.max(weeksTracked, 1))
                .build();
    }

    /**
     * Predict goal completion using simple linear regression
     */
    public LocalDate predictGoalCompletion(Long userId, Long goalId) {
        Optional<Goal> goalOpt = goalRepository.findByIdAndUserId(goalId, userId);
        if (goalOpt.isEmpty()) {
            return null;
        }

        Goal goal = goalOpt.get();
        if (goal.getTargetWeight() == null) {
            return null;
        }

        // Get last 30 days of metrics for trend calculation
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        List<BodyMetric> metrics = bodyMetricRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        if (metrics.size() < 2) {
            return goal.getTargetDate(); // Not enough data, return target date
        }

        // Simple linear regression to predict completion
        BigDecimal slope = calculateLinearRegressionSlope(metrics);

        if (slope == null || slope.compareTo(BigDecimal.ZERO) == 0) {
            return goal.getTargetDate();
        }

        BodyMetric latestMetric = metrics.get(metrics.size() - 1);
        BigDecimal currentWeight = latestMetric.getWeightKg();
        BigDecimal targetWeight = goal.getTargetWeight();
        BigDecimal weightDiff = targetWeight.subtract(currentWeight);

        // Check if we're moving in the right direction
        boolean isWeightLoss = goal.getGoalType() == Goal.GoalType.WEIGHT_LOSS;
        boolean movingRight = (isWeightLoss && slope.compareTo(BigDecimal.ZERO) < 0) ||
                (!isWeightLoss && slope.compareTo(BigDecimal.ZERO) > 0);

        if (!movingRight) {
            // Not moving toward goal, return null or far future date
            return null;
        }

        // Calculate days to reach target
        BigDecimal daysToTarget = weightDiff.divide(slope, 0, RoundingMode.HALF_UP).abs();

        return LocalDate.now().plusDays(daysToTarget.longValue());
    }

    // Helper methods

    private BigDecimal calculateMovingAverage(List<BodyMetric> metrics, int currentIndex, int windowSize) {
        int start = Math.max(0, currentIndex - windowSize + 1);
        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;

        for (int i = start; i <= currentIndex; i++) {
            if (metrics.get(i).getWeightKg() != null) {
                sum = sum.add(metrics.get(i).getWeightKg());
                count++;
            }
        }

        if (count == 0)
            return null;
        return sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateRateOfChange(List<BodyMetric> metrics, int currentIndex) {
        if (currentIndex == 0 || metrics.get(currentIndex).getWeightKg() == null) {
            return BigDecimal.ZERO;
        }

        // Look back up to 7 days for rate calculation
        int lookbackIndex = Math.max(0, currentIndex - 7);
        BodyMetric current = metrics.get(currentIndex);
        BodyMetric previous = metrics.get(lookbackIndex);

        if (previous.getWeightKg() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal weightDiff = current.getWeightKg().subtract(previous.getWeightKg());
        long daysDiff = ChronoUnit.DAYS.between(previous.getMeasurementDate(), current.getMeasurementDate());

        if (daysDiff == 0)
            return BigDecimal.ZERO;

        // Convert to weekly rate
        BigDecimal dailyRate = weightDiff.divide(BigDecimal.valueOf(daysDiff), 4, RoundingMode.HALF_UP);
        return dailyRate.multiply(BigDecimal.valueOf(7)).setScale(2, RoundingMode.HALF_UP);
    }

    private GoalProgressDto calculateSingleGoalProgress(Goal goal, BigDecimal currentWeight, BigDecimal startWeight) {
        BigDecimal targetWeight = goal.getTargetWeight();
        BigDecimal progressPercentage = BigDecimal.ZERO;
        Integer daysRemaining = null;

        if (targetWeight != null && startWeight != null && currentWeight != null) {
            BigDecimal totalChange = targetWeight.subtract(startWeight);
            BigDecimal currentChange = currentWeight.subtract(startWeight);

            if (totalChange.compareTo(BigDecimal.ZERO) != 0) {
                progressPercentage = currentChange.divide(totalChange, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP);

                // Cap at 100% or 0%
                if (progressPercentage.compareTo(BigDecimal.valueOf(100)) > 0) {
                    progressPercentage = BigDecimal.valueOf(100);
                } else if (progressPercentage.compareTo(BigDecimal.ZERO) < 0) {
                    progressPercentage = BigDecimal.ZERO;
                }
            }
        }

        if (goal.getTargetDate() != null) {
            daysRemaining = (int) ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
            if (daysRemaining < 0)
                daysRemaining = 0;
        }

        return GoalProgressDto.builder()
                .goalId(goal.getId())
                .goalType(goal.getGoalType().name())
                .currentValue(currentWeight)
                .targetValue(targetWeight)
                .startValue(startWeight)
                .progressPercentage(progressPercentage)
                .targetDate(goal.getTargetDate())
                .daysRemaining(daysRemaining)
                .status(goal.getStatus().name())
                .build();
    }

    private LocalDate calculateStartDate(String period) {
        LocalDate now = LocalDate.now();
        return switch (period.toLowerCase()) {
            case "30d" -> now.minusDays(30);
            case "90d" -> now.minusDays(90);
            case "1y" -> now.minusYears(1);
            case "all" -> now.minusYears(10); // Effectively all data
            default -> now.minusDays(30);
        };
    }

    private BigDecimal calculateLinearRegressionSlope(List<BodyMetric> metrics) {
        if (metrics.size() < 2)
            return null;

        // Simple least squares linear regression
        int n = metrics.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        LocalDate firstDate = metrics.get(0).getMeasurementDate();

        for (BodyMetric metric : metrics) {
            if (metric.getWeightKg() == null)
                continue;

            double x = ChronoUnit.DAYS.between(firstDate, metric.getMeasurementDate());
            double y = metric.getWeightKg().doubleValue();

            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        double denominator = n * sumX2 - sumX * sumX;
        if (denominator == 0)
            return null;

        double slope = (n * sumXY - sumX * sumY) / denominator;

        return BigDecimal.valueOf(slope).setScale(4, RoundingMode.HALF_UP);
    }
}
