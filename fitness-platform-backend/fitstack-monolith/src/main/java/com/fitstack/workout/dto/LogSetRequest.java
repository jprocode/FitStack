package com.fitstack.workout.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogSetRequest {
    @NotNull(message = "Exercise ID is required")
    private Long exerciseId;

    @NotNull(message = "Set number is required")
    @Positive
    private Integer setNumber;

    @NotNull(message = "Reps completed is required")
    @Positive
    private Integer repsCompleted;

    @NotNull(message = "Weight used is required")
    private BigDecimal weightUsed;
}

