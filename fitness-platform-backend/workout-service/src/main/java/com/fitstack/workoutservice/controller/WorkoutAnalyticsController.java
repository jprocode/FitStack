package com.fitstack.workoutservice.controller;

import com.fitstack.workoutservice.dto.PersonalRecordDto;
import com.fitstack.workoutservice.dto.ProgressiveOverloadDto;
import com.fitstack.workoutservice.dto.VolumeProgressionDto;
import com.fitstack.workoutservice.dto.WorkoutFrequencyDto;
import com.fitstack.workoutservice.service.WorkoutAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/workouts/analytics")
@RequiredArgsConstructor
public class WorkoutAnalyticsController {

    private final WorkoutAnalyticsService analyticsService;

    /**
     * Get workout frequency data (workouts per week)
     */
    @GetMapping("/frequency")
    public ResponseEntity<List<WorkoutFrequencyDto>> getWorkoutFrequency(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Default to last 90 days if no dates provided
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(90);
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<WorkoutFrequencyDto> frequency = analyticsService.getWorkoutFrequency(
                userId, startDateTime, endDateTime);
        return ResponseEntity.ok(frequency);
    }

    /**
     * Get volume progression data
     */
    @GetMapping("/volume")
    public ResponseEntity<List<VolumeProgressionDto>> getVolumeProgression(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) Long exerciseId,
            @RequestParam(defaultValue = "90d") String period) {

        List<VolumeProgressionDto> volume = analyticsService.getVolumeProgression(
                userId, exerciseId, period);
        return ResponseEntity.ok(volume);
    }

    /**
     * Get personal records for all exercises
     */
    @GetMapping("/personal-records")
    public ResponseEntity<List<PersonalRecordDto>> getPersonalRecords(
            @RequestHeader("X-User-Id") Long userId) {

        List<PersonalRecordDto> records = analyticsService.getPersonalRecords(userId);
        return ResponseEntity.ok(records);
    }

    /**
     * Get progressive overload suggestions
     */
    @GetMapping("/progressive-overload")
    public ResponseEntity<List<ProgressiveOverloadDto>> getProgressiveOverloadSuggestions(
            @RequestHeader("X-User-Id") Long userId) {

        List<ProgressiveOverloadDto> suggestions = analyticsService.getProgressiveOverloadSuggestions(userId);
        return ResponseEntity.ok(suggestions);
    }
}

