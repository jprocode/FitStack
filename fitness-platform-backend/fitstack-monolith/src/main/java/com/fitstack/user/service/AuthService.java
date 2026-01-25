package com.fitstack.user.service;

import com.fitstack.config.exception.BadRequestException;
import com.fitstack.config.exception.UnauthorizedException;
import com.fitstack.user.config.JwtUtil;
import com.fitstack.user.dto.AuthResponse;
import com.fitstack.user.dto.LoginRequest;
import com.fitstack.user.dto.RegisterRequest;
import com.fitstack.user.entity.RefreshToken;
import com.fitstack.user.entity.User;
import com.fitstack.user.repository.RefreshTokenRepository;
import com.fitstack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RateLimitService rateLimitService;
    private final TokenBlacklistService tokenBlacklistService;

    @Value("${jwt.refresh-expiration:604800000}") // Default 7 days
    private Long refreshTokenExpiration;

    @Transactional("usersTransactionManager")
    public AuthResponse register(RegisterRequest request, String ipAddress) {
        // Rate limit registration attempts
        if (rateLimitService.isBlocked(ipAddress, RateLimitService.EndpointType.REGISTER)) {
            long remaining = rateLimitService.getRemainingLockoutSeconds(ipAddress,
                    RateLimitService.EndpointType.REGISTER);
            log.warn("SECURITY: Registration blocked for IP {} - rate limited for {} minutes", ipAddress,
                    remaining / 60);
            throw new BadRequestException(
                    String.format("Too many registration attempts. Try again in %d minutes.", remaining / 60 + 1));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            rateLimitService.recordFailedAttempt(ipAddress, RateLimitService.EndpointType.REGISTER);
            log.warn("SECURITY: Registration attempt with existing email {} from IP {}", request.getEmail(), ipAddress);
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        user = userRepository.save(user);
        log.info("AUTH: New user registered - ID: {}, Email: {}, IP: {}", user.getId(), user.getEmail(), ipAddress);

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        RefreshToken refreshToken = createRefreshToken(user.getId());

        rateLimitService.recordSuccess(ipAddress, RateLimitService.EndpointType.REGISTER);
        return buildAuthResponse(user, token, refreshToken.getToken());
    }

    public AuthResponse login(LoginRequest request, String ipAddress) {
        // Check rate limiting
        if (rateLimitService.isBlocked(ipAddress)) {
            long remaining = rateLimitService.getRemainingLockoutSeconds(ipAddress);
            log.warn("SECURITY: Login blocked for IP {} - rate limited for {} minutes", ipAddress, remaining / 60);
            throw new BadRequestException(
                    String.format("Too many failed attempts. Try again in %d minutes.", remaining / 60 + 1));
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    rateLimitService.recordFailedAttempt(ipAddress);
                    log.warn("SECURITY: Failed login attempt - unknown email {} from IP {}", request.getEmail(),
                            ipAddress);
                    return new UnauthorizedException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            rateLimitService.recordFailedAttempt(ipAddress);
            log.warn("SECURITY: Failed login attempt - wrong password for user {} from IP {}", user.getId(), ipAddress);
            throw new UnauthorizedException("Invalid email or password");
        }

        // Successful login - clear rate limit
        rateLimitService.recordSuccessfulLogin(ipAddress);
        log.info("AUTH: Successful login - User: {}, IP: {}, RememberMe: {}", user.getId(), ipAddress,
                request.isRememberMe());

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), request.isRememberMe());
        RefreshToken refreshToken = createRefreshToken(user.getId());

        return buildAuthResponse(user, token, refreshToken.getToken());
    }

    @Transactional("usersTransactionManager")
    public AuthResponse refreshToken(String refreshTokenStr, String ipAddress) {
        // Rate limit refresh attempts
        if (rateLimitService.isBlocked(ipAddress, RateLimitService.EndpointType.REFRESH)) {
            long remaining = rateLimitService.getRemainingLockoutSeconds(ipAddress,
                    RateLimitService.EndpointType.REFRESH);
            log.warn("SECURITY: Token refresh blocked for IP {} - rate limited", ipAddress);
            throw new BadRequestException(
                    String.format("Too many refresh attempts. Try again in %d minutes.", remaining / 60 + 1));
        }

        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenStr)
                .orElseThrow(() -> {
                    rateLimitService.recordFailedAttempt(ipAddress, RateLimitService.EndpointType.REFRESH);
                    log.warn("SECURITY: Invalid refresh token attempt from IP {}", ipAddress);
                    return new UnauthorizedException("Invalid refresh token");
                });

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            rateLimitService.recordFailedAttempt(ipAddress, RateLimitService.EndpointType.REFRESH);
            log.warn("SECURITY: Expired refresh token attempt from IP {}", ipAddress);
            throw new UnauthorizedException("Refresh token expired");
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Generate new access token
        String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getId());

        // Rotate refresh token (more secure)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        RefreshToken newRefreshToken = createRefreshToken(user.getId());

        rateLimitService.recordSuccess(ipAddress, RateLimitService.EndpointType.REFRESH);
        log.info("AUTH: Token refreshed for user {} from IP {}", user.getId(), ipAddress);

        return buildAuthResponse(user, newAccessToken, newRefreshToken.getToken());
    }

    @Transactional("usersTransactionManager")
    public void logout(String accessToken) {
        try {
            String jti = jwtUtil.extractJti(accessToken);
            Instant expiry = jwtUtil.extractExpirationInstant(accessToken);
            Long userId = jwtUtil.extractUserId(accessToken);

            // Blacklist the access token
            tokenBlacklistService.blacklist(jti, expiry);

            // Revoke all refresh tokens for this user
            refreshTokenRepository.revokeAllByUserId(userId);

            log.info("AUTH: User {} logged out successfully", userId);
        } catch (Exception e) {
            log.warn("Error during logout: {}", e.getMessage());
        }
    }

    @Transactional("usersTransactionManager")
    public void deleteAccount(Long userId, String password, String currentToken) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        // Note: Password verification removed - frontend uses confirmation phrase
        // "delete-my-account"
        // This simplifies deletion for both OAuth and password users

        // Blacklist current token
        try {
            String jti = jwtUtil.extractJti(currentToken);
            Instant expiry = jwtUtil.extractExpirationInstant(currentToken);
            tokenBlacklistService.blacklist(jti, expiry);
        } catch (Exception e) {
            log.warn("Could not blacklist token during account deletion: {}", e.getMessage());
        }

        // Delete refresh tokens
        refreshTokenRepository.deleteByUserId(userId);

        // Delete user
        userRepository.delete(user);

        log.info("AUTH: Account deleted for user {} (email: {})", userId, user.getEmail());
    }

    private RefreshToken createRefreshToken(Long userId) {
        // Revoke old refresh tokens for this user
        refreshTokenRepository.revokeAllByUserId(userId);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .userId(userId)
                .expiryDate(Instant.now().plus(refreshTokenExpiration, ChronoUnit.MILLIS))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpiration())
                .refreshToken(refreshToken)
                .refreshTokenExpiresIn(refreshTokenExpiration)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .isOAuthUser(user.getPasswordHash() == null)
                        .build())
                .build();
    }
}
