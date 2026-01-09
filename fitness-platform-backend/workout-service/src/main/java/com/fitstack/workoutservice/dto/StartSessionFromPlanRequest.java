package com.fitstack.workoutservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to start a workout session from a workout plan day.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartSessionFromPlanRequest {

    @NotNull(message = "Plan day ID is required")
    private Long planDayId;
}
