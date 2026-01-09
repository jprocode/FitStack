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
public class WorkoutPlanDto {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private String planType;
    private Boolean isActive;
    private List<WorkoutPlanDayDto> days;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
