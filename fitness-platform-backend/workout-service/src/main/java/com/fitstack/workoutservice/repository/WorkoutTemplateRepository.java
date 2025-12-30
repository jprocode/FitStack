package com.fitstack.workoutservice.repository;

import com.fitstack.workoutservice.entity.WorkoutTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutTemplateRepository extends JpaRepository<WorkoutTemplate, Long> {

    List<WorkoutTemplate> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<WorkoutTemplate> findByIdAndUserId(Long id, Long userId);

    List<WorkoutTemplate> findByIsPublicTrueOrderByCreatedAtDesc();
}

