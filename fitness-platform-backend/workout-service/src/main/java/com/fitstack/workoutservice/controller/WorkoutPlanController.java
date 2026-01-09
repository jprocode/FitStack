package com.fitstack.workoutservice.controller;

import com.fitstack.workoutservice.dto.*;
import com.fitstack.workoutservice.service.TodaysWorkoutService;
import com.fitstack.workoutservice.service.WorkoutPlanService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts/plans")
@RequiredArgsConstructor
@Slf4j
public class WorkoutPlanController {

    private final WorkoutPlanService planService;
    private final TodaysWorkoutService todaysWorkoutService;

    @GetMapping
    public ResponseEntity<List<WorkoutPlanDto>> getPlans(HttpServletRequest request) {
        Long userId = getUserId(request);
        log.info("Getting workout plans for user: {}", userId);
        List<WorkoutPlanDto> plans = planService.getUserPlans(userId);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutPlanDto> getPlanById(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserId(request);
        WorkoutPlanDto plan = planService.getPlanById(id, userId);
        return ResponseEntity.ok(plan);
    }

    @PostMapping
    public ResponseEntity<WorkoutPlanDto> createPlan(
            HttpServletRequest request,
            @Valid @RequestBody CreatePlanRequest createRequest) {
        Long userId = getUserId(request);
        log.info("Creating workout plan for user: {}", userId);
        WorkoutPlanDto created = planService.createPlan(userId, createRequest);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutPlanDto> updatePlan(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody CreatePlanRequest updateRequest) {
        Long userId = getUserId(request);
        WorkoutPlanDto updated = planService.updatePlan(id, userId, updateRequest);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserId(request);
        planService.deletePlan(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{planId}/days")
    public ResponseEntity<WorkoutPlanDayDto> addDay(
            HttpServletRequest request,
            @PathVariable Long planId,
            @Valid @RequestBody CreatePlanDayRequest dayRequest) {
        Long userId = getUserId(request);
        WorkoutPlanDayDto day = planService.addDayToPlan(planId, userId, dayRequest);
        return new ResponseEntity<>(day, HttpStatus.CREATED);
    }

    @PutMapping("/{planId}/days/{dayId}")
    public ResponseEntity<WorkoutPlanDayDto> updateDay(
            HttpServletRequest request,
            @PathVariable Long planId,
            @PathVariable Long dayId,
            @Valid @RequestBody CreatePlanDayRequest dayRequest) {
        Long userId = getUserId(request);
        WorkoutPlanDayDto day = planService.updateDay(planId, dayId, userId, dayRequest);
        return ResponseEntity.ok(day);
    }

    @DeleteMapping("/{planId}/days/{dayId}")
    public ResponseEntity<Void> deleteDay(
            HttpServletRequest request,
            @PathVariable Long planId,
            @PathVariable Long dayId) {
        Long userId = getUserId(request);
        planService.deleteDay(planId, dayId, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/set-primary")
    public ResponseEntity<WorkoutPlanDto> setPrimaryPlan(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserId(request);
        log.info("Setting plan {} as primary for user: {}", id, userId);
        WorkoutPlanDto plan = planService.setPrimaryPlan(id, userId);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/primary")
    public ResponseEntity<WorkoutPlanDto> getPrimaryPlan(HttpServletRequest request) {
        Long userId = getUserId(request);
        log.info("Getting primary plan for user: {}", userId);
        return planService.getPrimaryPlan(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/primary/today")
    public ResponseEntity<TodaysWorkoutDto> getTodaysWorkout(HttpServletRequest request) {
        Long userId = getUserId(request);
        log.info("Getting today's workout for user: {}", userId);
        TodaysWorkoutDto todaysWorkout = todaysWorkoutService.getTodaysWorkout(userId);
        return ResponseEntity.ok(todaysWorkout);
    }

    private Long getUserId(HttpServletRequest request) {
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader != null) {
            return Long.parseLong(userIdHeader);
        }
        Object userId = request.getAttribute("userId");
        return userId != null ? (Long) userId : null;
    }
}
