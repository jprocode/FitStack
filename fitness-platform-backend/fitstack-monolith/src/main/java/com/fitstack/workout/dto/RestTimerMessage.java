package com.fitstack.workout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestTimerMessage {
    private Long sessionId;
    private Integer remainingSeconds;
    private Integer totalSeconds;
    private boolean active;
    private Long exerciseId;
    private Integer setNumber;
}

