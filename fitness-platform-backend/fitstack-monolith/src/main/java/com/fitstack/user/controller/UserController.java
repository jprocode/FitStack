package com.fitstack.user.controller;

import com.fitstack.user.dto.CalorieTargetDto;
import com.fitstack.user.dto.UpdateProfileRequest;
import com.fitstack.user.dto.UserProfileDto;
import com.fitstack.user.service.UserProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserProfileService userProfileService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(HttpServletRequest request) {
        Long userId = getUserId(request);
        UserProfileDto profile = userProfileService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            HttpServletRequest request,
            @Valid @RequestBody UpdateProfileRequest updateRequest) {
        Long userId = getUserId(request);
        UserProfileDto profile = userProfileService.updateProfile(userId, updateRequest);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/profile/calorie-targets")
    public ResponseEntity<CalorieTargetDto> getCalorieTargets(HttpServletRequest request) {
        Long userId = getUserId(request);
        CalorieTargetDto targets = userProfileService.getCalorieTargets(userId);
        return ResponseEntity.ok(targets);
    }

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }
}
