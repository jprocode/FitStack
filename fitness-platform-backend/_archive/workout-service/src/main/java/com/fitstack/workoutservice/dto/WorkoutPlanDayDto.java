package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanDayDto {
    private Long id;
    private String dayIdentifier;
    private String name;
    private Integer orderIndex;
    private List<PlanDayExerciseDto> exercises;
}
