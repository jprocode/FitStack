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
public class CreatePlanDayRequest {
    private String dayIdentifier; // "MONDAY" or "1"
    private String name; // Optional: "Push Day"
    private Integer orderIndex;
    private List<AddExerciseToDayRequest> exercises;
}
