package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolumeProgressionDto {
    private LocalDate date;
    private BigDecimal totalVolume; // weight x reps
    private Integer totalSets;
    private Integer totalReps;
    private Map<String, BigDecimal> exerciseBreakdown; // exerciseName -> volume
}

