package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseDto {
    private Long id;
    private String name;
    private String muscleGroup;
    private String equipment;
    private String difficulty;
    private String instructions;
    private String gifUrl;
    private LocalDateTime createdAt;
}

