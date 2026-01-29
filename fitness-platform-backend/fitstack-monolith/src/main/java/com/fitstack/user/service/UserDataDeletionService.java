package com.fitstack.user.service;

import com.fitstack.nutrition.repository.CustomFoodRepository;
import com.fitstack.nutrition.repository.MealFoodRepository;
import com.fitstack.nutrition.repository.MealPlanRepository;
import com.fitstack.nutrition.repository.MealRepository;
import com.fitstack.nutrition.entity.Meal;
import com.fitstack.user.repository.BodyMetricRepository;
import com.fitstack.user.repository.GoalRepository;
import com.fitstack.user.repository.RefreshTokenRepository;
import com.fitstack.user.repository.UserProfileRepository;
import com.fitstack.workout.repository.WorkoutPlanDayRepository;
import com.fitstack.workout.repository.WorkoutPlanRepository;
import com.fitstack.workout.repository.WorkoutSessionRepository;
import com.fitstack.workout.repository.WorkoutSetRepository;
import com.fitstack.workout.repository.WorkoutTemplateExerciseRepository;
import com.fitstack.workout.repository.WorkoutTemplateRepository;
import com.fitstack.workout.entity.WorkoutPlan;
import com.fitstack.workout.entity.WorkoutSession;
import com.fitstack.workout.entity.WorkoutTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Centralized service for deleting all user data across all schemas.
 * Handles the correct deletion order to respect foreign key constraints.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDataDeletionService {

    // Workout repositories
    private final WorkoutSetRepository workoutSetRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutTemplateExerciseRepository workoutTemplateExerciseRepository;
    private final WorkoutTemplateRepository workoutTemplateRepository;
    private final WorkoutPlanDayRepository workoutPlanDayRepository;
    private final WorkoutPlanRepository workoutPlanRepository;

    // Nutrition repositories
    private final MealFoodRepository mealFoodRepository;
    private final MealRepository mealRepository;
    private final MealPlanRepository mealPlanRepository;
    private final CustomFoodRepository customFoodRepository;

    // User repositories
    private final BodyMetricRepository bodyMetricRepository;
    private final GoalRepository goalRepository;
    private final UserProfileRepository userProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Deletes ALL data associated with a user in the correct order.
     * This should be called before deleting the User entity itself.
     * 
     * Deletion order (children first):
     * 1. Workout sets (child of sessions)
     * 2. Workout sessions
     * 3. Workout template exercises (child of templates)
     * 4. Workout templates
     * 5. Workout plan day exercises & days (cascade via plan)
     * 6. Workout plans
     * 7. Meal foods (child of meals)
     * 8. Meals
     * 9. Meal plans
     * 10. Custom foods
     * 11. Body metrics
     * 12. Goals
     * 13. User profile
     * 14. Refresh tokens
     */
    @Transactional
    public void deleteAllUserData(Long userId) {
        log.info("Starting deletion of all data for user {}", userId);

        // ===== WORKOUT DATA =====

        // 1. Delete workout sets (need to get session IDs first)
        List<WorkoutSession> sessions = workoutSessionRepository.findByUserIdOrderByStartedAtDesc(userId);
        if (!sessions.isEmpty()) {
            List<Long> sessionIds = sessions.stream().map(WorkoutSession::getId).toList();
            workoutSetRepository.deleteBySessionIdIn(sessionIds);
            log.debug("Deleted workout sets for {} sessions", sessionIds.size());
        }

        // 2. Delete workout sessions
        workoutSessionRepository.deleteByUserId(userId);
        log.debug("Deleted workout sessions for user {}", userId);

        // 3. Delete workout template exercises (need to get template IDs first)
        List<WorkoutTemplate> templates = workoutTemplateRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (WorkoutTemplate template : templates) {
            workoutTemplateExerciseRepository.deleteByTemplateId(template.getId());
        }
        log.debug("Deleted workout template exercises for {} templates", templates.size());

        // 4. Delete workout templates
        workoutTemplateRepository.deleteByUserId(userId);
        log.debug("Deleted workout templates for user {}", userId);

        // 5. Delete workout plan days and their exercises (need to get plan IDs first)
        List<WorkoutPlan> plans = workoutPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (WorkoutPlan plan : plans) {
            // WorkoutPlanDay has cascade delete for exercises, so just delete days
            workoutPlanDayRepository.deleteByWorkoutPlanId(plan.getId());
        }
        log.debug("Deleted workout plan days for {} plans", plans.size());

        // 6. Delete workout plans
        workoutPlanRepository.deleteByUserId(userId);
        log.debug("Deleted workout plans for user {}", userId);

        // ===== NUTRITION DATA =====

        // 7. Delete meal foods (need to get meal IDs first)
        List<Meal> meals = mealRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId);
        for (Meal meal : meals) {
            mealFoodRepository.deleteByMealId(meal.getId());
        }
        log.debug("Deleted meal foods for {} meals", meals.size());

        // 8. Delete meals
        mealRepository.deleteByUserId(userId);
        log.debug("Deleted meals for user {}", userId);

        // 9. Delete meal plans
        mealPlanRepository.deleteByUserId(userId);
        log.debug("Deleted meal plans for user {}", userId);

        // 10. Delete custom foods
        customFoodRepository.deleteByUserId(userId);
        log.debug("Deleted custom foods for user {}", userId);

        // ===== USER DATA =====

        // 11. Delete body metrics
        bodyMetricRepository.deleteByUserId(userId);
        log.debug("Deleted body metrics for user {}", userId);

        // 12. Delete goals
        goalRepository.deleteByUserId(userId);
        log.debug("Deleted goals for user {}", userId);

        // 13. Delete user profile
        userProfileRepository.deleteByUserId(userId);
        log.debug("Deleted user profile for user {}", userId);

        // 14. Delete refresh tokens
        refreshTokenRepository.deleteByUserId(userId);
        log.debug("Deleted refresh tokens for user {}", userId);

        log.info("Successfully deleted all data for user {}", userId);
    }
}
