package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanDayExerciseDto {
    private Long id;
    private Long exerciseId;
    private String exerciseName;
    private String muscleGroup;
    private Integer orderIndex;
    private Integer targetSets;
    private String targetReps;
    private Integer restSeconds;
    private String notes;
}
