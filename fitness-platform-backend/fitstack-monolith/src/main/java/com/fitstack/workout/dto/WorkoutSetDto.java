package com.fitstack.workout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSetDto {
    private Long id;
    private Long sessionId;
    private Long exerciseId;
    private ExerciseDto exercise;
    private Integer setNumber;
    private Integer repsCompleted;
    private BigDecimal weightUsed;
    private LocalDateTime completedAt;
}

