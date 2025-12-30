package com.fitstack.userservice.controller;

import com.fitstack.userservice.dto.UpdateProfileRequest;
import com.fitstack.userservice.dto.UserProfileDto;
import com.fitstack.userservice.service.UserProfileService;
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
            @Valid @RequestBody UpdateProfileRequest updateRequest
    ) {
        Long userId = getUserId(request);
        UserProfileDto profile = userProfileService.updateProfile(userId, updateRequest);
        return ResponseEntity.ok(profile);
    }

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }
}

