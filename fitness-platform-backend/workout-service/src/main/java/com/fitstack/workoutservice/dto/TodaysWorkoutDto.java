package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO representing today's workout based on the user's primary plan.
 * Includes day detection logic for both WEEKLY and NUMBERED plans.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodaysWorkoutDto {

    private Long planId;
    private String planName;
    private String planType; // WEEKLY or NUMBERED

    // Detection info
    private String detectedDay; // e.g., "MONDAY" or "3"
    private String dayLabel; // e.g., "Monday" or "Day 3"
    private boolean isRestDay; // True if no workout defined for this day

    // For NUMBERED plans - tracks progress
    private Integer lastCompletedDay;

    // The actual workout for today
    private WorkoutPlanDayDto workoutDay;

    // All available days (for manual day selection override)
    private List<WorkoutPlanDayDto> allDays;
}
