package com.fitstack.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

/**
 * Redis-backed rate limiting service for various endpoints.
 * Blocks IP addresses after too many failed/excessive attempts.
 * Data persists across server restarts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private static final String RATE_LIMIT_PREFIX = "ratelimit:";
    private static final String ATTEMPTS_SUFFIX = ":attempts";
    private static final String LOCKOUT_SUFFIX = ":lockout";

    // Configurable limits per endpoint type
    private static final int LOGIN_MAX_ATTEMPTS = 5;
    private static final long LOGIN_LOCKOUT_SECONDS = 15 * 60; // 15 minutes

    private static final int REGISTER_MAX_ATTEMPTS = 3;
    private static final long REGISTER_LOCKOUT_SECONDS = 60 * 60; // 1 hour

    private static final int REFRESH_MAX_ATTEMPTS = 10;
    private static final long REFRESH_LOCKOUT_SECONDS = 5 * 60; // 5 minutes

    private static final int GENERAL_MAX_ATTEMPTS = 100;
    private static final long GENERAL_LOCKOUT_SECONDS = 60; // 1 minute

    private final StringRedisTemplate redisTemplate;

    public enum EndpointType {
        LOGIN, REGISTER, REFRESH, GENERAL
    }

    /**
     * Check if an IP is currently blocked for a specific endpoint
     */
    public boolean isBlocked(String ipAddress, EndpointType type) {
        String lockoutKey = buildLockoutKey(ipAddress, type);
        return Boolean.TRUE.equals(redisTemplate.hasKey(lockoutKey));
    }

    /**
     * Overload for backward compatibility
     */
    public boolean isBlocked(String ipAddress) {
        return isBlocked(ipAddress, EndpointType.LOGIN);
    }

    /**
     * Get remaining lockout seconds for an IP
     */
    public long getRemainingLockoutSeconds(String ipAddress, EndpointType type) {
        String lockoutKey = buildLockoutKey(ipAddress, type);
        Long ttl = redisTemplate.getExpire(lockoutKey);
        return ttl != null && ttl > 0 ? ttl : 0;
    }

    public long getRemainingLockoutSeconds(String ipAddress) {
        return getRemainingLockoutSeconds(ipAddress, EndpointType.LOGIN);
    }

    /**
     * Record a failed attempt for an endpoint
     */
    public void recordFailedAttempt(String ipAddress, EndpointType type) {
        String attemptsKey = buildAttemptsKey(ipAddress, type);
        String lockoutKey = buildLockoutKey(ipAddress, type);
        int maxAttempts = getMaxAttempts(type);
        long lockoutSeconds = getLockoutSeconds(type);

        // Increment attempts counter
        Long attempts = redisTemplate.opsForValue().increment(attemptsKey);

        // Set expiry on attempts key if it's new (expires after lockout period)
        if (attempts != null && attempts == 1) {
            redisTemplate.expire(attemptsKey, Duration.ofSeconds(lockoutSeconds * 2));
        }

        // Check if we should lock out
        if (attempts != null && attempts >= maxAttempts) {
            redisTemplate.opsForValue().set(lockoutKey, String.valueOf(Instant.now().toEpochMilli()),
                    Duration.ofSeconds(lockoutSeconds));
            log.warn("IP {} blocked for {} endpoint - {} attempts, lockout {} minutes",
                    ipAddress, type, attempts, lockoutSeconds / 60);
        }
    }

    public void recordFailedAttempt(String ipAddress) {
        recordFailedAttempt(ipAddress, EndpointType.LOGIN);
    }

    /**
     * Record a successful action (clears failed attempts for that endpoint)
     */
    public void recordSuccessfulLogin(String ipAddress) {
        recordSuccess(ipAddress, EndpointType.LOGIN);
    }

    public void recordSuccess(String ipAddress, EndpointType type) {
        String attemptsKey = buildAttemptsKey(ipAddress, type);
        String lockoutKey = buildLockoutKey(ipAddress, type);
        redisTemplate.delete(attemptsKey);
        redisTemplate.delete(lockoutKey);
    }

    /**
     * Get number of failed attempts for an IP/endpoint
     */
    public int getFailedAttempts(String ipAddress, EndpointType type) {
        String attemptsKey = buildAttemptsKey(ipAddress, type);
        String value = redisTemplate.opsForValue().get(attemptsKey);
        return value != null ? Integer.parseInt(value) : 0;
    }

    /**
     * Get remaining attempts before lockout
     */
    public int getRemainingAttempts(String ipAddress, EndpointType type) {
        return Math.max(0, getMaxAttempts(type) - getFailedAttempts(ipAddress, type));
    }

    public int getRemainingAttempts(String ipAddress) {
        return getRemainingAttempts(ipAddress, EndpointType.LOGIN);
    }

    private String buildAttemptsKey(String ipAddress, EndpointType type) {
        return RATE_LIMIT_PREFIX + ipAddress + ":" + type.name() + ATTEMPTS_SUFFIX;
    }

    private String buildLockoutKey(String ipAddress, EndpointType type) {
        return RATE_LIMIT_PREFIX + ipAddress + ":" + type.name() + LOCKOUT_SUFFIX;
    }

    private int getMaxAttempts(EndpointType type) {
        return switch (type) {
            case LOGIN -> LOGIN_MAX_ATTEMPTS;
            case REGISTER -> REGISTER_MAX_ATTEMPTS;
            case REFRESH -> REFRESH_MAX_ATTEMPTS;
            case GENERAL -> GENERAL_MAX_ATTEMPTS;
        };
    }

    private long getLockoutSeconds(EndpointType type) {
        return switch (type) {
            case LOGIN -> LOGIN_LOCKOUT_SECONDS;
            case REGISTER -> REGISTER_LOCKOUT_SECONDS;
            case REFRESH -> REFRESH_LOCKOUT_SECONDS;
            case GENERAL -> GENERAL_LOCKOUT_SECONDS;
        };
    }
}
