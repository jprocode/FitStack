package com.fitstack.user.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory token blacklist for invalidated JWTs.
 * Tokens are stored by their JTI (JWT ID) claim.
 */
@Service
@Slf4j
public class TokenBlacklistService {

    // Map of JTI to expiry time (for cleanup)
    private final ConcurrentHashMap<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

    /**
     * Add a token to the blacklist
     * 
     * @param jti        The JWT ID
     * @param expiryTime When the token would naturally expire
     */
    public void blacklist(String jti, Instant expiryTime) {
        if (jti != null) {
            blacklistedTokens.put(jti, expiryTime);
            log.info("Token {} added to blacklist", jti);
            cleanupExpiredTokens();
        }
    }

    /**
     * Check if a token is blacklisted
     */
    public boolean isBlacklisted(String jti) {
        if (jti == null) {
            return false;
        }
        return blacklistedTokens.containsKey(jti);
    }

    /**
     * Blacklist all tokens for a user (used on account deletion or password change)
     * Note: This requires storing user's token JTIs, which we'll track separately
     */
    public void blacklistAllForUser(Long userId, Set<String> tokenJtis, Instant expiryTime) {
        for (String jti : tokenJtis) {
            blacklist(jti, expiryTime);
        }
        log.info("Blacklisted {} tokens for user {}", tokenJtis.size(), userId);
    }

    /**
     * Remove expired tokens from blacklist (they're already invalid anyway)
     */
    private void cleanupExpiredTokens() {
        Instant now = Instant.now();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }

    /**
     * Get count of blacklisted tokens (for monitoring)
     */
    public int getBlacklistSize() {
        cleanupExpiredTokens();
        return blacklistedTokens.size();
    }
}
