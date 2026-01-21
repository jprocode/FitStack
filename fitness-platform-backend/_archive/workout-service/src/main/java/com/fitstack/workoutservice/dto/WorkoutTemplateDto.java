package com.fitstack.workoutservice.dto;

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
public class WorkoutTemplateDto {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private Boolean isPublic;
    private List<TemplateExerciseDto> exercises;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

