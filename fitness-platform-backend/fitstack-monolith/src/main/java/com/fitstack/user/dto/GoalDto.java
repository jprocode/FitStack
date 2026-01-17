package com.fitstack.user.dto;

import com.fitstack.user.entity.Goal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDto {

    private Long id;
    private Long userId;
    private Goal.GoalType goalType;
    private BigDecimal targetWeight;
    private LocalDate targetDate;
    private Goal.GoalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

