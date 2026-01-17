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
public class PersonalRecordDto {
    private Long exerciseId;
    private String exerciseName;
    private String muscleGroup;
    private BigDecimal maxWeight;
    private Integer maxReps;
    private BigDecimal maxVolume; // max single set volume (weight x reps)
    private BigDecimal estimatedOneRepMax; // Brzycki formula
    private LocalDateTime achievedAt;
    private Boolean isRecent; // achieved in last 30 days
}

