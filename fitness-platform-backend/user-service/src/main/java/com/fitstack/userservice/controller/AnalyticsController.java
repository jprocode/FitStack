package com.fitstack.userservice.controller;

import com.fitstack.userservice.config.JwtUtil;
import com.fitstack.userservice.dto.GoalProgressDto;
import com.fitstack.userservice.dto.MetricsStatsDto;
import com.fitstack.userservice.dto.WeightTrendDto;
import com.fitstack.userservice.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final JwtUtil jwtUtil;

    /**
     * Get weight trend data with moving average
     */
    @GetMapping("/weight-trend")
    public ResponseEntity<List<WeightTrendDto>> getWeightTrend(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Long userId = extractUserId(authHeader);
        
        // Default to last 90 days if no dates provided
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(90);
        }
        
        List<WeightTrendDto> trend = analyticsService.getWeightTrend(userId, startDate, endDate);
        return ResponseEntity.ok(trend);
    }

    /**
     * Get progress toward active goals
     */
    @GetMapping("/goal-progress")
    public ResponseEntity<List<GoalProgressDto>> getGoalProgress(
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = extractUserId(authHeader);
        List<GoalProgressDto> progress = analyticsService.calculateGoalProgress(userId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Get aggregate statistics for a period
     */
    @GetMapping("/stats")
    public ResponseEntity<MetricsStatsDto> getMetricsStats(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "30d") String period) {
        
        Long userId = extractUserId(authHeader);
        MetricsStatsDto stats = analyticsService.getMetricsStats(userId, period);
        return ResponseEntity.ok(stats);
    }

    /**
     * Predict goal completion date
     */
    @GetMapping("/predict/{goalId}")
    public ResponseEntity<LocalDate> predictGoalCompletion(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long goalId) {
        
        Long userId = extractUserId(authHeader);
        LocalDate predictedDate = analyticsService.predictGoalCompletion(userId, goalId);
        return ResponseEntity.ok(predictedDate);
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.extractUserId(token);
    }
}

