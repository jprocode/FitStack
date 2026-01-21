package com.fitstack.userservice.service;

import com.fitstack.userservice.dto.CalorieTargetDto;
import com.fitstack.userservice.dto.UpdateProfileRequest;
import com.fitstack.userservice.dto.UserProfileDto;
import com.fitstack.userservice.entity.User;
import com.fitstack.userservice.entity.UserProfile;
import com.fitstack.userservice.exception.NotFoundException;
import com.fitstack.userservice.repository.UserProfileRepository;
import com.fitstack.userservice.repository.UserRepository;
import com.fitstack.userservice.util.CalorieCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final BodyMetricService bodyMetricService;

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(null);

        return buildProfileDto(user, profile);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Update user fields
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        user = userRepository.save(user);

        // Update or create profile
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().user(user).build());

        if (request.getHeightCm() != null) {
            profile.setHeightCm(request.getHeightCm());
        }
        if (request.getBirthDate() != null) {
            profile.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getActivityLevel() != null) {
            profile.setActivityLevel(request.getActivityLevel());
        }
        if (request.getPreferredUnit() != null) {
            profile.setPreferredUnit(request.getPreferredUnit());
        }

        profile = userProfileRepository.save(profile);

        return buildProfileDto(user, profile);
    }

    public CalorieTargetDto getCalorieTargets(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found. Please complete your profile first."));

        // Get latest weight
        var latestMetric = bodyMetricService.getLatestMetric(userId);
        BigDecimal weight = latestMetric != null ? latestMetric.getWeightKg() : null;

        if (weight == null || profile.getHeightCm() == null || profile.getBirthDate() == null
                || profile.getGender() == null) {
            throw new NotFoundException(
                    "Missing required data. Please ensure you have: weight logged, height, birth date, and gender in your profile.");
        }

        // Calculate age
        int age = Period.between(profile.getBirthDate(), LocalDate.now()).getYears();

        // Calculate BMR
        BigDecimal bmr = CalorieCalculator.calculateBMR(weight, profile.getHeightCm(), age, profile.getGender());

        // Calculate TDEE
        String activityLevel = profile.getActivityLevel() != null ? profile.getActivityLevel() : "SEDENTARY";
        BigDecimal tdee = CalorieCalculator.calculateTDEE(bmr, activityLevel);

        return CalorieTargetDto.builder()
                .bmr(bmr)
                .tdee(tdee)
                .maintenanceCalories(tdee)
                .weightLossCalories(CalorieCalculator.calculateWeightLossTarget(tdee))
                .muscleGainCalories(CalorieCalculator.calculateMuscleGainTarget(tdee))
                .activityLevel(activityLevel)
                .build();
    }

    private UserProfileDto buildProfileDto(User user, UserProfile profile) {
        UserProfileDto.UserProfileDtoBuilder builder = UserProfileDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName());

        if (profile != null) {
            builder.id(profile.getId())
                    .heightCm(profile.getHeightCm())
                    .birthDate(profile.getBirthDate())
                    .gender(profile.getGender())
                    .activityLevel(profile.getActivityLevel())
                    .preferredUnit(profile.getPreferredUnit())
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt());
        }

        return builder.build();
    }
}
