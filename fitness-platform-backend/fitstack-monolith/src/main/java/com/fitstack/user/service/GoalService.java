package com.fitstack.user.service;

import com.fitstack.user.dto.CreateGoalRequest;
import com.fitstack.user.dto.GoalDto;
import com.fitstack.user.entity.Goal;
import com.fitstack.user.entity.User;
import com.fitstack.config.exception.NotFoundException;
import com.fitstack.user.repository.GoalRepository;
import com.fitstack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    @Transactional("usersTransactionManager")
    public GoalDto createGoal(Long userId, CreateGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Goal goal = Goal.builder()
                .user(user)
                .goalType(request.getGoalType())
                .targetWeight(request.getTargetWeight())
                .targetDate(request.getTargetDate())
                .status(Goal.GoalStatus.ACTIVE)
                .build();

        goal = goalRepository.save(goal);

        return toDto(goal);
    }

    public List<GoalDto> getGoals(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<GoalDto> getActiveGoals(Long userId) {
        return goalRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, Goal.GoalStatus.ACTIVE)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public GoalDto getGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new NotFoundException("Goal not found"));
        return toDto(goal);
    }

    @Transactional("usersTransactionManager")
    public GoalDto updateGoalStatus(Long userId, Long goalId, Goal.GoalStatus status) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new NotFoundException("Goal not found"));

        goal.setStatus(status);
        goal = goalRepository.save(goal);

        return toDto(goal);
    }

    @Transactional("usersTransactionManager")
    public void deleteGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new NotFoundException("Goal not found"));

        goalRepository.delete(goal);
    }

    private GoalDto toDto(Goal goal) {
        return GoalDto.builder()
                .id(goal.getId())
                .userId(goal.getUser().getId())
                .goalType(goal.getGoalType())
                .targetWeight(goal.getTargetWeight())
                .targetDate(goal.getTargetDate())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}

