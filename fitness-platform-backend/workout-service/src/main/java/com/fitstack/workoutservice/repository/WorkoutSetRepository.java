package com.fitstack.workoutservice.repository;

import com.fitstack.workoutservice.entity.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    List<WorkoutSet> findBySessionIdOrderByCompletedAtAsc(Long sessionId);

    List<WorkoutSet> findBySessionIdAndExerciseIdOrderBySetNumberAsc(Long sessionId, Long exerciseId);
}

