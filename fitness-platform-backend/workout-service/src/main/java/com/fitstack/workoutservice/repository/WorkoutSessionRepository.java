package com.fitstack.workoutservice.repository;

import com.fitstack.workoutservice.entity.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    List<WorkoutSession> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<WorkoutSession> findByIdAndUserId(Long id, Long userId);

    List<WorkoutSession> findByUserIdAndStatusOrderByStartedAtDesc(Long userId, WorkoutSession.SessionStatus status);
}

