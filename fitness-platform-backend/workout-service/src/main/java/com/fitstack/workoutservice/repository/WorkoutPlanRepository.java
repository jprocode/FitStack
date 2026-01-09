package com.fitstack.workoutservice.repository;

import com.fitstack.workoutservice.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {

    List<WorkoutPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT wp FROM WorkoutPlan wp LEFT JOIN FETCH wp.days WHERE wp.id = :id")
    Optional<WorkoutPlan> findByIdWithDays(@Param("id") Long id);

    @Query("SELECT wp FROM WorkoutPlan wp LEFT JOIN FETCH wp.days WHERE wp.id = :id AND wp.userId = :userId")
    Optional<WorkoutPlan> findByIdAndUserIdWithDays(@Param("id") Long id, @Param("userId") Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    Optional<WorkoutPlan> findByIdAndUserId(Long id, Long userId);

    List<WorkoutPlan> findByUserIdAndIsActiveTrue(Long userId);

    // Primary plan queries
    Optional<WorkoutPlan> findByUserIdAndIsPrimaryTrue(Long userId);

    @Query("SELECT wp FROM WorkoutPlan wp " +
            "LEFT JOIN FETCH wp.days d " +
            "LEFT JOIN FETCH d.exercises e " +
            "LEFT JOIN FETCH e.exercise " +
            "WHERE wp.userId = :userId AND wp.isPrimary = true")
    Optional<WorkoutPlan> findPrimaryWithDaysAndExercises(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE WorkoutPlan wp SET wp.isPrimary = false WHERE wp.userId = :userId AND wp.isPrimary = true")
    void clearPrimaryForUser(@Param("userId") Long userId);
}
