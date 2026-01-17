package com.fitstack.workout.controller;

import com.fitstack.workout.dto.CreateTemplateRequest;
import com.fitstack.workout.dto.UpdateTemplateRequest;
import com.fitstack.workout.dto.WorkoutTemplateDto;
import com.fitstack.workout.service.WorkoutTemplateService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts/templates")
@RequiredArgsConstructor
public class WorkoutTemplateController {

    private final WorkoutTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<WorkoutTemplateDto>> getTemplates(HttpServletRequest request) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(templateService.getTemplates(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutTemplateDto> getTemplate(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(templateService.getTemplate(userId, id));
    }

    @PostMapping
    public ResponseEntity<WorkoutTemplateDto> createTemplate(
            HttpServletRequest request,
            @Valid @RequestBody CreateTemplateRequest createRequest
    ) {
        Long userId = getUserId(request);
        WorkoutTemplateDto template = templateService.createTemplate(userId, createRequest);
        return new ResponseEntity<>(template, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutTemplateDto> updateTemplate(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTemplateRequest updateRequest
    ) {
        Long userId = getUserId(request);
        return ResponseEntity.ok(templateService.updateTemplate(userId, id, updateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        Long userId = getUserId(request);
        templateService.deleteTemplate(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(HttpServletRequest request) {
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader != null) {
            return Long.parseLong(userIdHeader);
        }
        // Fallback to attribute set by filter
        Object userId = request.getAttribute("userId");
        return userId != null ? (Long) userId : null;
    }
}

