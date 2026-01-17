package com.fitstack.user.dto;

import com.fitstack.user.entity.Goal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoalRequest {

    @NotNull(message = "Goal type is required")
    private Goal.GoalType goalType;

    @DecimalMin(value = "20.0", message = "Target weight must be at least 20 kg")
    @DecimalMax(value = "500.0", message = "Target weight must be less than 500 kg")
    private BigDecimal targetWeight;

    @Future(message = "Target date must be in the future")
    private LocalDate targetDate;
}

