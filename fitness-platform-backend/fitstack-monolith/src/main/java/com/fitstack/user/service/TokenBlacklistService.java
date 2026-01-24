package com.fitstack.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;

/**
 * Redis-backed token blacklist for invalidated JWTs.
 * Tokens are stored by their JTI (JWT ID) claim with automatic TTL expiration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "token:blacklist:";

    private final StringRedisTemplate redisTemplate;

    /**
     * Add a token to the blacklist
     * 
     * @param jti        The JWT ID
     * @param expiryTime When the token would naturally expire
     */
    public void blacklist(String jti, Instant expiryTime) {
        if (jti == null) {
            return;
        }

        String key = BLACKLIST_PREFIX + jti;
        Duration ttl = Duration.between(Instant.now(), expiryTime);

        if (ttl.isNegative() || ttl.isZero()) {
            // Token already expired, no need to blacklist
            return;
        }

        redisTemplate.opsForValue().set(key, "1", ttl);
        log.info("Token {} added to blacklist (TTL: {} seconds)", jti, ttl.toSeconds());
    }

    /**
     * Check if a token is blacklisted
     */
    public boolean isBlacklisted(String jti) {
        if (jti == null) {
            return false;
        }
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + jti));
    }

    /**
     * Blacklist all tokens for a user (used on account deletion or password change)
     */
    public void blacklistAllForUser(Long userId, Set<String> tokenJtis, Instant expiryTime) {
        for (String jti : tokenJtis) {
            blacklist(jti, expiryTime);
        }
        log.info("Blacklisted {} tokens for user {}", tokenJtis.size(), userId);
    }

    /**
     * Get approximate count of blacklisted tokens (for monitoring)
     */
    public long getBlacklistSize() {
        Set<String> keys = redisTemplate.keys(BLACKLIST_PREFIX + "*");
        return keys != null ? keys.size() : 0;
    }
}
