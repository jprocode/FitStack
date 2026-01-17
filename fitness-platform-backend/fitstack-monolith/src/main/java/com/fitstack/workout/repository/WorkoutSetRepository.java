package com.fitstack.workout.repository;

import com.fitstack.workout.entity.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    List<WorkoutSet> findBySessionIdOrderByCompletedAtAsc(Long sessionId);

    List<WorkoutSet> findBySessionIdAndExerciseIdOrderBySetNumberAsc(Long sessionId, Long exerciseId);

    // Batch fetch for multiple sessions
    List<WorkoutSet> findBySessionIdIn(List<Long> sessionIds);

    // Find all sets for an exercise across all sessions for a user
    @Query("SELECT ws FROM WorkoutSet ws JOIN ws.session s WHERE s.userId = :userId AND ws.exercise.id = :exerciseId ORDER BY ws.completedAt DESC")
    List<WorkoutSet> findByUserIdAndExerciseId(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);

    // Max weight for an exercise by user
    @Query("SELECT MAX(ws.weightUsed) FROM WorkoutSet ws JOIN ws.session s WHERE s.userId = :userId AND ws.exercise.id = :exerciseId")
    BigDecimal findMaxWeightByUserIdAndExerciseId(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);

    // Max reps for an exercise by user
    @Query("SELECT MAX(ws.repsCompleted) FROM WorkoutSet ws JOIN ws.session s WHERE s.userId = :userId AND ws.exercise.id = :exerciseId")
    Integer findMaxRepsByUserIdAndExerciseId(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);

    // Get all distinct exercises a user has performed
    @Query("SELECT DISTINCT ws.exercise.id FROM WorkoutSet ws JOIN ws.session s WHERE s.userId = :userId")
    List<Long> findDistinctExerciseIdsByUserId(@Param("userId") Long userId);

    // Get the most recent sets for an exercise
    @Query("SELECT ws FROM WorkoutSet ws JOIN ws.session s WHERE s.userId = :userId AND ws.exercise.id = :exerciseId AND s.status = 'COMPLETED' ORDER BY ws.completedAt DESC")
    List<WorkoutSet> findRecentSetsByUserIdAndExerciseId(@Param("userId") Long userId,
            @Param("exerciseId") Long exerciseId);

    // Delete sets by session IDs
    void deleteBySessionIdIn(List<Long> sessionIds);
}
