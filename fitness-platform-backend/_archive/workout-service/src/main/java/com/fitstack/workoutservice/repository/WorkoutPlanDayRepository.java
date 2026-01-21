package com.fitstack.workoutservice.repository;

import com.fitstack.workoutservice.entity.WorkoutPlanDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutPlanDayRepository extends JpaRepository<WorkoutPlanDay, Long> {

    List<WorkoutPlanDay> findByWorkoutPlanIdOrderByOrderIndex(Long workoutPlanId);

    @Query("SELECT d FROM WorkoutPlanDay d LEFT JOIN FETCH d.exercises WHERE d.id = :id")
    Optional<WorkoutPlanDay> findByIdWithExercises(@Param("id") Long id);

    Optional<WorkoutPlanDay> findByIdAndWorkoutPlanId(Long id, Long workoutPlanId);

    void deleteByWorkoutPlanId(Long workoutPlanId);
}
