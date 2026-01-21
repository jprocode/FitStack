package com.fitstack.userservice.controller;

import com.fitstack.userservice.dto.CreateGoalRequest;
import com.fitstack.userservice.dto.GoalDto;
import com.fitstack.userservice.entity.Goal;
import com.fitstack.userservice.service.GoalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalDto> createGoal(
            HttpServletRequest request,
            @Valid @RequestBody CreateGoalRequest createRequest
    ) {
        Long userId = getUserId(request);
        GoalDto goal = goalService.createGoal(userId, createRequest);
        return new ResponseEntity<>(goal, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GoalDto>> getGoals(HttpServletRequest request) {
        Long userId = getUserId(request);
        List<GoalDto> goals = goalService.getGoals(userId);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/active")
    public ResponseEntity<List<GoalDto>> getActiveGoals(HttpServletRequest request) {
        Long userId = getUserId(request);
        List<GoalDto> goals = goalService.getActiveGoals(userId);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/{goalId}")
    public ResponseEntity<GoalDto> getGoal(
            HttpServletRequest request,
            @PathVariable Long goalId
    ) {
        Long userId = getUserId(request);
        GoalDto goal = goalService.getGoal(userId, goalId);
        return ResponseEntity.ok(goal);
    }

    @PutMapping("/{goalId}/status")
    public ResponseEntity<GoalDto> updateGoalStatus(
            HttpServletRequest request,
            @PathVariable Long goalId,
            @RequestParam Goal.GoalStatus status
    ) {
        Long userId = getUserId(request);
        GoalDto goal = goalService.updateGoalStatus(userId, goalId, status);
        return ResponseEntity.ok(goal);
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
            HttpServletRequest request,
            @PathVariable Long goalId
    ) {
        Long userId = getUserId(request);
        goalService.deleteGoal(userId, goalId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }
}

