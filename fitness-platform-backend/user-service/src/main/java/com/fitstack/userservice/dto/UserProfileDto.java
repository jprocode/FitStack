package com.fitstack.userservice.dto;

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
public class UserProfileDto {

    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private BigDecimal heightCm;
    private LocalDate birthDate;
    private String gender;
    private String activityLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

