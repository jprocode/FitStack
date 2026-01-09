package com.fitstack.workoutservice.controller;

import com.fitstack.workoutservice.dto.*;
import com.fitstack.workoutservice.service.WorkoutSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutSessionController {

    private final WorkoutSessionService sessionService;

    @PostMapping("/sessions")
    public ResponseEntity<WorkoutSessionDto> startSession(
            HttpServletRequest request,
            @Valid @RequestBody StartSessionRequest startRequest) {
        Long userId = getUserId(request);
        WorkoutSessionDto session = sessionService.startSession(userId, startRequest);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @PostMapping("/sessions/start-from-plan")
    public ResponseEntity<WorkoutSessionDto> startSessionFromPlan(
            HttpServletRequest request,
            @Valid @RequestBody StartSessionFromPlanRequest startRequest) {
        Long userId = getUserId(request);
        WorkoutSessionDto session = sessionService.startSessionFromPlan(userId, startRequest.getPlanDayId());
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<WorkoutSessionDto> getSession(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(sessionService.getSession(userId, id));
    }

    @PostMapping("/sessions/{id}/sets")
    public ResponseEntity<WorkoutSetDto> logSet(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody LogSetRequest logRequest) {
        Long userId = getUserId(request);
        WorkoutSetDto set = sessionService.logSet(userId, id, logRequest);
        return new ResponseEntity<>(set, HttpStatus.CREATED);
    }

    @PutMapping("/sessions/{id}/complete")
    public ResponseEntity<WorkoutSessionDto> completeSession(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody(required = false) CompleteSessionRequest completeRequest) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(sessionService.completeSession(userId, id, completeRequest));
    }

    @GetMapping("/history")
    public ResponseEntity<List<WorkoutSessionDto>> getHistory(HttpServletRequest request) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(sessionService.getHistory(userId));
    }

    private Long getUserId(HttpServletRequest request) {
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader != null) {
            return Long.parseLong(userIdHeader);
        }
        Object userId = request.getAttribute("userId");
        return userId != null ? (Long) userId : null;
    }
}
