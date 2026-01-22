package com.fitstack.user.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory rate limiting service for various endpoints.
 * Blocks IP addresses after too many failed/excessive attempts.
 */
@Service
@Slf4j
public class RateLimitService {

    // Configurable limits per endpoint type
    private static final int LOGIN_MAX_ATTEMPTS = 5;
    private static final long LOGIN_LOCKOUT_SECONDS = 15 * 60; // 15 minutes

    private static final int REGISTER_MAX_ATTEMPTS = 3;
    private static final long REGISTER_LOCKOUT_SECONDS = 60 * 60; // 1 hour

    private static final int REFRESH_MAX_ATTEMPTS = 10;
    private static final long REFRESH_LOCKOUT_SECONDS = 5 * 60; // 5 minutes

    private static final int GENERAL_MAX_ATTEMPTS = 100;
    private static final long GENERAL_LOCKOUT_SECONDS = 60; // 1 minute

    private static final long CLEANUP_THRESHOLD_SECONDS = 60 * 60; // 1 hour

    private final ConcurrentHashMap<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    public enum EndpointType {
        LOGIN, REGISTER, REFRESH, GENERAL
    }

    /**
     * Check if an IP is currently blocked for a specific endpoint
     */
    public boolean isBlocked(String ipAddress, EndpointType type) {
        String key = buildKey(ipAddress, type);
        AttemptInfo info = attempts.get(key);
        if (info == null) {
            return false;
        }

        // Check if lockout has expired
        if (info.lockedUntil != null && Instant.now().isAfter(info.lockedUntil)) {
            attempts.remove(key);
            return false;
        }

        return info.lockedUntil != null && Instant.now().isBefore(info.lockedUntil);
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
        String key = buildKey(ipAddress, type);
        AttemptInfo info = attempts.get(key);
        if (info == null || info.lockedUntil == null) {
            return 0;
        }
        long remaining = info.lockedUntil.getEpochSecond() - Instant.now().getEpochSecond();
        return Math.max(0, remaining);
    }

    public long getRemainingLockoutSeconds(String ipAddress) {
        return getRemainingLockoutSeconds(ipAddress, EndpointType.LOGIN);
    }

    /**
     * Record a failed attempt for an endpoint
     */
    public void recordFailedAttempt(String ipAddress, EndpointType type) {
        String key = buildKey(ipAddress, type);
        int maxAttempts = getMaxAttempts(type);
        long lockoutSeconds = getLockoutSeconds(type);

        attempts.compute(key, (k, info) -> {
            if (info == null) {
                info = new AttemptInfo();
            }
            info.failedAttempts++;
            info.lastAttempt = Instant.now();

            if (info.failedAttempts >= maxAttempts) {
                info.lockedUntil = Instant.now().plusSeconds(lockoutSeconds);
                log.warn("IP {} blocked for {} endpoint - {} attempts, lockout {} minutes",
                        ipAddress, type, info.failedAttempts, lockoutSeconds / 60);
            }

            return info;
        });

        cleanupOldEntries();
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
        String key = buildKey(ipAddress, type);
        attempts.remove(key);
    }

    /**
     * Get number of failed attempts for an IP/endpoint
     */
    public int getFailedAttempts(String ipAddress, EndpointType type) {
        String key = buildKey(ipAddress, type);
        AttemptInfo info = attempts.get(key);
        return info != null ? info.failedAttempts : 0;
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

    private String buildKey(String ipAddress, EndpointType type) {
        return ipAddress + ":" + type.name();
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

    private void cleanupOldEntries() {
        Instant threshold = Instant.now().minusSeconds(CLEANUP_THRESHOLD_SECONDS);
        attempts.entrySet().removeIf(entry -> entry.getValue().lastAttempt.isBefore(threshold) &&
                (entry.getValue().lockedUntil == null || Instant.now().isAfter(entry.getValue().lockedUntil)));
    }

    private static class AttemptInfo {
        int failedAttempts = 0;
        Instant lastAttempt = Instant.now();
        Instant lockedUntil = null;
    }
}
