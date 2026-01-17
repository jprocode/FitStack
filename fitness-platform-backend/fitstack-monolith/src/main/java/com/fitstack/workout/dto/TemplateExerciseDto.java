package com.fitstack.workout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateExerciseDto {
    private Long id;
    private Long exerciseId;
    private ExerciseDto exercise;
    private Integer orderIndex;
    private Integer targetSets;
    private Integer targetReps;
    private BigDecimal targetWeight;
    private String notes;
}

