package com.fitstack.workoutservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SetCompleteMessage {
    private Long sessionId;
    private Long exerciseId;
    private Integer setNumber;
    private Integer repsCompleted;
    private BigDecimal weightUsed;
    private Integer restTimeSeconds;
}

