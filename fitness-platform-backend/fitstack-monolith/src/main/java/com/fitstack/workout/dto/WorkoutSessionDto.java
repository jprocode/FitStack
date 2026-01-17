package com.fitstack.workout.dto;

import com.fitstack.workout.entity.WorkoutSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSessionDto {
    private Long id;
    private Long userId;
    private Long templateId;
    private WorkoutTemplateDto template;
    // Plan-based session fields
    private Long planDayId;
    private String planDayName;
    private List<PlanDayExerciseDto> planDayExercises;
    // Timestamps and status
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private WorkoutSession.SessionStatus status;
    private String notes;
    private List<WorkoutSetDto> sets;
}
