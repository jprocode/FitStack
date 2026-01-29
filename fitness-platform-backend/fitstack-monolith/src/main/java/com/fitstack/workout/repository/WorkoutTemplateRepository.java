package com.fitstack.workout.repository;

import com.fitstack.workout.entity.WorkoutTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutTemplateRepository extends JpaRepository<WorkoutTemplate, Long> {

    List<WorkoutTemplate> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<WorkoutTemplate> findByIdAndUserId(Long id, Long userId);

    List<WorkoutTemplate> findByIsPublicTrueOrderByCreatedAtDesc();

    // For user account deletion
    void deleteByUserId(Long userId);
}
