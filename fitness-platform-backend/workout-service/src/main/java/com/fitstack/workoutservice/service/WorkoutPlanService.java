package com.fitstack.workoutservice.service;

import com.fitstack.workoutservice.dto.*;
import com.fitstack.workoutservice.entity.*;
import com.fitstack.workoutservice.exception.NotFoundException;
import com.fitstack.workoutservice.repository.ExerciseRepository;
import com.fitstack.workoutservice.repository.WorkoutPlanDayRepository;
import com.fitstack.workoutservice.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkoutPlanService {

    private final WorkoutPlanRepository planRepository;
    private final WorkoutPlanDayRepository dayRepository;
    private final ExerciseRepository exerciseRepository;

    public List<WorkoutPlanDto> getUserPlans(Long userId) {
        log.info("Getting workout plans for user: {}", userId);
        return planRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public WorkoutPlanDto getPlanById(Long id, Long userId) {
        WorkoutPlan plan = planRepository.findByIdAndUserIdWithDays(id, userId)
                .orElseThrow(() -> new NotFoundException("Workout plan not found"));
        return toDtoWithDays(plan);
    }

    @Transactional
    public WorkoutPlanDto createPlan(Long userId, CreatePlanRequest request) {
        log.info("Creating workout plan for user: {}", userId);

        WorkoutPlan plan = WorkoutPlan.builder()
                .userId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .planType(WorkoutPlan.PlanType.valueOf(request.getPlanType()))
                .isActive(true)
                .days(new ArrayList<>())
                .build();

        // Add days if provided
        if (request.getDays() != null) {
            for (int i = 0; i < request.getDays().size(); i++) {
                CreatePlanDayRequest dayReq = request.getDays().get(i);
                WorkoutPlanDay day = createDayEntity(plan, dayReq, i);
                plan.getDays().add(day);
            }
        }

        WorkoutPlan saved = planRepository.save(plan);
        log.info("Created workout plan with id: {}", saved.getId());
        return toDtoWithDays(saved);
    }

    @Transactional
    public WorkoutPlanDto updatePlan(Long id, Long userId, CreatePlanRequest request) {
        log.info("Updating workout plan {} for user: {}", id, userId);

        WorkoutPlan plan = planRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Workout plan not found"));

        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        if (request.getPlanType() != null) {
            plan.setPlanType(WorkoutPlan.PlanType.valueOf(request.getPlanType()));
        }

        WorkoutPlan saved = planRepository.save(plan);
        return toDtoWithDays(saved);
    }

    @Transactional
    public void deletePlan(Long id, Long userId) {
        log.info("Deleting workout plan {} for user: {}", id, userId);

        if (!planRepository.existsByIdAndUserId(id, userId)) {
            throw new NotFoundException("Workout plan not found");
        }

        planRepository.deleteById(id);
    }

    @Transactional
    public WorkoutPlanDayDto addDayToPlan(Long planId, Long userId, CreatePlanDayRequest request) {
        log.info("Adding day to plan {} for user: {}", planId, userId);

        WorkoutPlan plan = planRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new NotFoundException("Workout plan not found"));

        int orderIndex = request.getOrderIndex() != null ? request.getOrderIndex() : plan.getDays().size();
        WorkoutPlanDay day = createDayEntity(plan, request, orderIndex);

        WorkoutPlanDay saved = dayRepository.save(day);
        return toDayDto(saved);
    }

    @Transactional
    public WorkoutPlanDayDto updateDay(Long planId, Long dayId, Long userId, CreatePlanDayRequest request) {
        log.info("Updating day {} in plan {} for user: {}", dayId, planId, userId);

        if (!planRepository.existsByIdAndUserId(planId, userId)) {
            throw new NotFoundException("Workout plan not found");
        }

        WorkoutPlanDay day = dayRepository.findByIdAndWorkoutPlanId(dayId, planId)
                .orElseThrow(() -> new NotFoundException("Day not found"));

        day.setDayIdentifier(request.getDayIdentifier());
        day.setName(request.getName());
        if (request.getOrderIndex() != null) {
            day.setOrderIndex(request.getOrderIndex());
        }

        // Update exercises if provided
        if (request.getExercises() != null) {
            day.getExercises().clear();
            for (int i = 0; i < request.getExercises().size(); i++) {
                AddExerciseToDayRequest exReq = request.getExercises().get(i);
                WorkoutPlanDayExercise exercise = createExerciseEntity(day, exReq, i);
                day.getExercises().add(exercise);
            }
        }

        WorkoutPlanDay saved = dayRepository.save(day);
        return toDayDto(saved);
    }

    @Transactional
    public void deleteDay(Long planId, Long dayId, Long userId) {
        log.info("Deleting day {} from plan {} for user: {}", dayId, planId, userId);

        if (!planRepository.existsByIdAndUserId(planId, userId)) {
            throw new NotFoundException("Workout plan not found");
        }

        WorkoutPlanDay day = dayRepository.findByIdAndWorkoutPlanId(dayId, planId)
                .orElseThrow(() -> new NotFoundException("Day not found"));

        dayRepository.delete(day);
    }

    private WorkoutPlanDay createDayEntity(WorkoutPlan plan, CreatePlanDayRequest request, int defaultOrder) {
        WorkoutPlanDay day = WorkoutPlanDay.builder()
                .workoutPlan(plan)
                .dayIdentifier(request.getDayIdentifier())
                .name(request.getName())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : defaultOrder)
                .exercises(new ArrayList<>())
                .build();

        if (request.getExercises() != null) {
            for (int i = 0; i < request.getExercises().size(); i++) {
                AddExerciseToDayRequest exReq = request.getExercises().get(i);
                WorkoutPlanDayExercise exercise = createExerciseEntity(day, exReq, i);
                day.getExercises().add(exercise);
            }
        }

        return day;
    }

    private WorkoutPlanDayExercise createExerciseEntity(WorkoutPlanDay day, AddExerciseToDayRequest request,
            int defaultOrder) {
        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new NotFoundException("Exercise not found: " + request.getExerciseId()));

        return WorkoutPlanDayExercise.builder()
                .planDay(day)
                .exercise(exercise)
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : defaultOrder)
                .targetSets(request.getTargetSets())
                .targetReps(request.getTargetReps())
                .restSeconds(request.getRestSeconds())
                .notes(request.getNotes())
                .build();
    }

    private WorkoutPlanDto toDto(WorkoutPlan plan) {
        return WorkoutPlanDto.builder()
                .id(plan.getId())
                .userId(plan.getUserId())
                .name(plan.getName())
                .description(plan.getDescription())
                .planType(plan.getPlanType().name())
                .isActive(plan.getIsActive())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }

    private WorkoutPlanDto toDtoWithDays(WorkoutPlan plan) {
        WorkoutPlanDto dto = toDto(plan);
        dto.setDays(plan.getDays().stream()
                .map(this::toDayDto)
                .collect(Collectors.toList()));
        return dto;
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
