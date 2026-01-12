package com.fitstack.workoutservice.repository;

import com.fitstack.workoutservice.entity.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

        List<WorkoutSession> findByUserIdOrderByStartedAtDesc(Long userId);

        Optional<WorkoutSession> findByIdAndUserId(Long id, Long userId);

        List<WorkoutSession> findByUserIdAndStatusOrderByStartedAtDesc(Long userId,
                        WorkoutSession.SessionStatus status);

        // Analytics queries
        List<WorkoutSession> findByUserIdAndStartedAtBetweenOrderByStartedAtAsc(
                        Long userId, LocalDateTime startDate, LocalDateTime endDate);

        Long countByUserIdAndStartedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);

        List<WorkoutSession> findByUserIdAndStatusAndStartedAtBetweenOrderByStartedAtAsc(
                        Long userId, WorkoutSession.SessionStatus status, LocalDateTime startDate,
                        LocalDateTime endDate);

        @Query("SELECT ws FROM WorkoutSession ws WHERE ws.userId = :userId AND ws.status = 'COMPLETED' ORDER BY ws.startedAt DESC")
        List<WorkoutSession> findCompletedByUserIdOrderByStartedAtDesc(@Param("userId") Long userId);

        // Delete all sessions for a user
        void deleteByUserId(Long userId);
}
