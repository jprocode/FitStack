package com.fitstack.workout.service;

import com.fitstack.workout.dto.PlanDayExerciseDto;
import com.fitstack.workout.dto.TodaysWorkoutDto;
import com.fitstack.workout.dto.WorkoutPlanDayDto;
import com.fitstack.workout.entity.WorkoutPlan;
import com.fitstack.workout.entity.WorkoutPlanDay;
import com.fitstack.workout.entity.WorkoutPlanDayExercise;
import com.fitstack.config.exception.NotFoundException;
import com.fitstack.workout.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for determining today's workout based on the user's primary plan.
 * Handles both WEEKLY (day of week) and NUMBERED (sequential progress) plan
 * types.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TodaysWorkoutService {

    private final WorkoutPlanRepository planRepository;

    /**
     * Get today's workout for the user's primary plan.
     * 
     * For WEEKLY plans: Returns the workout for today's day of the week
     * For NUMBERED plans: Returns the next day after lastCompletedDay
     */
    @Transactional(value = "workoutsTransactionManager", readOnly = true)
    public TodaysWorkoutDto getTodaysWorkout(Long userId) {
        log.info("Getting today's workout for user: {}", userId);

        // First find the primary plan
        WorkoutPlan primaryPlan = planRepository.findByUserIdAndIsPrimaryTrue(userId)
                .orElseThrow(() -> new NotFoundException(
                        "No primary workout plan set. Please set a plan as primary first."));

        // Now fetch with days and exercises using a separate query
        primaryPlan = planRepository.findByIdWithDays(primaryPlan.getId())
                .orElseThrow(() -> new NotFoundException("Plan not found"));

        // Initialize exercises for each day (within transaction)
        for (WorkoutPlanDay day : primaryPlan.getDays()) {
            day.getExercises().size(); // Force initialization
            for (WorkoutPlanDayExercise ex : day.getExercises()) {
                ex.getExercise().getId(); // Force initialization of exercise
            }
        }

        if (primaryPlan.getPlanType() == WorkoutPlan.PlanType.WEEKLY) {
            return getWeeklyWorkout(primaryPlan);
        } else {
            return getNumberedWorkout(primaryPlan);
        }
    }

    /**
     * Get today's workout for a WEEKLY plan.
     * Matches the current day of the week to the plan's days.
     */
    private TodaysWorkoutDto getWeeklyWorkout(WorkoutPlan plan) {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        String todayName = today.name(); // MONDAY, TUESDAY, etc.

        log.debug("Looking for {} workout in plan {}", todayName, plan.getId());

        WorkoutPlanDay todayDay = plan.getDays().stream()
                .filter(d -> d.getDayIdentifier().equalsIgnoreCase(todayName))
                .findFirst()
                .orElse(null);

        boolean isRestDay = todayDay == null;

        return TodaysWorkoutDto.builder()
                .planId(plan.getId())
                .planName(plan.getName())
                .planType("WEEKLY")
                .detectedDay(todayName)
                .dayLabel(formatDayName(todayName))
                .isRestDay(isRestDay)
                .workoutDay(isRestDay ? null : toDayDto(todayDay))
                .allDays(plan.getDays().stream()
                        .map(this::toDayDto)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Get today's workout for a NUMBERED plan.
     * Returns the next day after the last completed day, wrapping around if needed.
     */
    private TodaysWorkoutDto getNumberedWorkout(WorkoutPlan plan) {
        int lastCompleted = plan.getLastCompletedDay() != null ? plan.getLastCompletedDay() : 0;
        int totalDays = plan.getDays().size();

        // Calculate next day (1-indexed)
        int nextDay = lastCompleted + 1;

        // Wrap around if exceeded total days
        if (nextDay > totalDays && totalDays > 0) {
            nextDay = 1;
        }

        log.debug("NUMBERED plan: lastCompleted={}, totalDays={}, nextDay={}",
                lastCompleted, totalDays, nextDay);

        String nextDayIdentifier = String.valueOf(nextDay);
        WorkoutPlanDay nextWorkoutDay = plan.getDays().stream()
                .filter(d -> d.getDayIdentifier().equals(nextDayIdentifier))
                .findFirst()
                .orElse(null);

        boolean isRestDay = nextWorkoutDay == null;

        return TodaysWorkoutDto.builder()
                .planId(plan.getId())
                .planName(plan.getName())
                .planType("NUMBERED")
                .lastCompletedDay(lastCompleted)
                .detectedDay(nextDayIdentifier)
                .dayLabel("Day " + nextDay)
                .isRestDay(isRestDay)
                .workoutDay(isRestDay ? null : toDayDto(nextWorkoutDay))
                .allDays(plan.getDays().stream()
                        .map(this::toDayDto)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Format day name for display (MONDAY -> Monday)
     */
    private String formatDayName(String day) {
        if (day == null || day.isEmpty())
            return day;
        return day.charAt(0) + day.substring(1).toLowerCase();
    }

    private WorkoutPlanDayDto toDayDto(WorkoutPlanDay day) {
        return WorkoutPlanDayDto.builder()
                .id(day.getId())
                .dayIdentifier(day.getDayIdentifier())
                .name(day.getName())
                .orderIndex(day.getOrderIndex())
                .exercises(day.getExercises().stream()
                        .map(this::toExerciseDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private PlanDayExerciseDto toExerciseDto(WorkoutPlanDayExercise ex) {
        return PlanDayExerciseDto.builder()
                .id(ex.getId())
                .exerciseId(ex.getExercise().getId())
                .exerciseName(ex.getExercise().getName())
                .muscleGroup(ex.getExercise().getMuscleGroup())
                .orderIndex(ex.getOrderIndex())
                .targetSets(ex.getTargetSets())
                .targetReps(ex.getTargetReps())
                .restSeconds(ex.getRestSeconds())
                .notes(ex.getNotes())
                .build();
    }
}
