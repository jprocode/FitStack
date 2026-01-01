package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressiveOverloadDto {
    private Long exerciseId;
    private String exerciseName;
    private String muscleGroup;
    private BigDecimal lastWeight;
    private BigDecimal suggestedWeight;
    private Integer lastReps;
    private Integer suggestedReps;
    private Integer lastSets;
    private String reasoning;
    private String progressType; // WEIGHT, REPS, SETS
}

