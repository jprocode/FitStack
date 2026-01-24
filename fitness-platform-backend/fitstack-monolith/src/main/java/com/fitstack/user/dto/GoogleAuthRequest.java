package com.fitstack.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    // Access token from Google OAuth (used to verify with Google's API)
    private String idToken;

    // User info from frontend (fetched from Google's userinfo endpoint)
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Google ID is required")
    private String googleId;

    private String firstName;
    private String lastName;
}
