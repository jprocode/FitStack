package com.fitstack.user.service;

import com.fitstack.config.exception.BadRequestException;
import com.fitstack.user.config.JwtUtil;
import com.fitstack.user.dto.AuthResponse;
import com.fitstack.user.dto.GoogleAuthRequest;
import com.fitstack.user.entity.RefreshToken;
import com.fitstack.user.entity.User;
import com.fitstack.user.entity.UserProfile;
import com.fitstack.user.repository.RefreshTokenRepository;
import com.fitstack.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final WebClient webClient;
    private final String googleClientId;

    @Value("${jwt.refresh-expiration:604800000}")
    private Long refreshTokenExpiration;

    public GoogleOAuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtUtil jwtUtil,
            @Value("${google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtil = jwtUtil;
        this.googleClientId = googleClientId;
        this.webClient = WebClient.builder()
                .baseUrl("https://www.googleapis.com")
                .build();

        log.info("GoogleOAuthService initialized with client ID: {}...",
                googleClientId.substring(0, Math.min(20, googleClientId.length())));
    }

    @Transactional("usersTransactionManager")
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        // Verify the access token with Google's tokeninfo endpoint
        verifyAccessToken(request.getIdToken(), request.getEmail());

        String googleId = request.getGoogleId();
        String email = request.getEmail();
        String firstName = request.getFirstName();
        String lastName = request.getLastName();

        log.info("Google OAuth: Authenticating user with email: {}", email);

        // Find existing user by googleId or email
        User user = findOrCreateUser(googleId, email, firstName, lastName);

        // Generate tokens
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        RefreshToken refreshToken = createRefreshToken(user.getId());

        log.info("AUTH: Google OAuth login successful - User: {}", user.getId());

        return buildAuthResponse(user, token, refreshToken.getToken());
    }

    @SuppressWarnings("unchecked")
    private void verifyAccessToken(String accessToken, String expectedEmail) {
        try {
            // Verify the access token with Google's tokeninfo endpoint
            Map<String, Object> tokenInfo = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/oauth2/v3/tokeninfo")
                            .queryParam("access_token", accessToken)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (tokenInfo == null) {
                throw new BadRequestException("Failed to verify Google access token");
            }

            // Verify the token is for our application
            String audience = (String) tokenInfo.get("aud");
            if (audience == null || !audience.equals(googleClientId)) {
                // For access tokens, check azp (authorized party) instead of aud
                String azp = (String) tokenInfo.get("azp");
                if (azp == null || !azp.equals(googleClientId)) {
                    log.warn("SECURITY: Google token audience mismatch. Expected: {}, Got aud: {}, azp: {}",
                            googleClientId, audience, azp);
                    throw new BadRequestException("Invalid Google token - audience mismatch");
                }
            }

            // Verify email matches
            String tokenEmail = (String) tokenInfo.get("email");
            if (tokenEmail == null || !tokenEmail.equalsIgnoreCase(expectedEmail)) {
                log.warn("SECURITY: Google token email mismatch. Expected: {}, Got: {}", expectedEmail, tokenEmail);
                throw new BadRequestException("Invalid Google token - email mismatch");
            }

            log.debug("Google access token verified successfully for email: {}", expectedEmail);

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("SECURITY: Error verifying Google access token", e);
            throw new BadRequestException("Failed to verify Google access token");
        }
    }

    private User findOrCreateUser(String googleId, String email, String firstName, String lastName) {
        // First, try to find by googleId
        Optional<User> existingByGoogleId = userRepository.findByGoogleId(googleId);
        if (existingByGoogleId.isPresent()) {
            log.info("Google OAuth: Found existing user by googleId");
            return existingByGoogleId.get();
        }

        // Check if user exists by email (might have registered with password before)
        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            // Link Google account to existing user
            User user = existingByEmail.get();
            user.setGoogleId(googleId);
            // Update name if not already set
            if (user.getFirstName() == null && firstName != null) {
                user.setFirstName(firstName);
            }
            if (user.getLastName() == null && lastName != null) {
                user.setLastName(lastName);
            }
            log.info("Google OAuth: Linked Google account to existing user");
            return userRepository.save(user);
        }

        // Create new user
        User newUser = User.builder()
                .email(email)
                .googleId(googleId)
                .firstName(firstName)
                .lastName(lastName)
                .passwordHash(null) // OAuth users don't have passwords
                .build();

        User savedUser = userRepository.save(newUser);

        // Create profile for new user
        UserProfile profile = UserProfile.builder()
                .user(savedUser)
                .build();
        savedUser.setProfile(profile);

        log.info("Google OAuth: Created new user with email: {}", email);
        return userRepository.save(savedUser);
    }

    private RefreshToken createRefreshToken(Long userId) {
        // Invalidate existing refresh tokens for this user
        refreshTokenRepository.deleteByUserId(userId);

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(java.util.UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String token, String refreshTokenStr) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400L) // 24 hours in seconds
                .refreshToken(refreshTokenStr)
                .refreshTokenExpiresIn(refreshTokenExpiration / 1000)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .build())
                .build();
    }
}
