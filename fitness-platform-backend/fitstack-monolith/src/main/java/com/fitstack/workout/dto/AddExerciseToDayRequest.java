package com.fitstack.workout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddExerciseToDayRequest {
    private Long exerciseId;
    private Integer orderIndex;
    private Integer targetSets;
    private String targetReps;
    private Integer restSeconds;
    private String notes;
}
