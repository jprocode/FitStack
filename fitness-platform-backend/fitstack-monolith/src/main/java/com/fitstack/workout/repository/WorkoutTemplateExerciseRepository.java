package com.fitstack.workout.repository;

import com.fitstack.workout.entity.WorkoutTemplateExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutTemplateExerciseRepository extends JpaRepository<WorkoutTemplateExercise, Long> {

    List<WorkoutTemplateExercise> findByTemplateIdOrderByOrderIndexAsc(Long templateId);

    void deleteByTemplateId(Long templateId);
}

