package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutFrequencyDto {
    private LocalDate date;
    private Integer workoutCount;
    private Integer weekNumber;
    private String weekLabel; // e.g., "Week of Jan 1"
}

