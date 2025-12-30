package com.fitstack.userservice.repository;

import com.fitstack.userservice.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    
    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Goal> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Goal.GoalStatus status);
    
    Optional<Goal> findByIdAndUserId(Long id, Long userId);
    
    Optional<Goal> findTopByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Goal.GoalStatus status);
}

