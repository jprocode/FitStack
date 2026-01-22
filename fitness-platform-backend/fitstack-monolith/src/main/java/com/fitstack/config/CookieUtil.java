package com.fitstack.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Utility for managing httpOnly cookies for tokens.
 * This provides an alternative to localStorage storage for enhanced XSS
 * protection.
 * 
 * To enable cookie-based auth:
 * 1. Set auth.use-cookies=true in application.properties
 * 2. Frontend should NOT store token in localStorage when using cookies
 * 3. Frontend should set withCredentials: true on axios
 */
@Component
public class CookieUtil {

    @Value("${auth.use-cookies:false}")
    private boolean useCookies;

    @Value("${auth.cookie-domain:}")
    private String cookieDomain;

    @Value("${auth.secure-cookies:true}")
    private boolean secureCookies;

    private static final String ACCESS_TOKEN_COOKIE = "access_token";
    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    public boolean isUsingCookies() {
        return useCookies;
    }

    /**
     * Add access token as httpOnly cookie
     */
    public void addAccessTokenCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        if (!useCookies)
            return;

        Cookie cookie = new Cookie(ACCESS_TOKEN_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookies);
        cookie.setPath("/");
        cookie.setMaxAge((int) maxAgeSeconds);
        if (!cookieDomain.isEmpty()) {
            cookie.setDomain(cookieDomain);
        }
        // SameSite=Strict for CSRF protection
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    /**
     * Add refresh token as httpOnly cookie
     */
    public void addRefreshTokenCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        if (!useCookies)
            return;

        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookies);
        cookie.setPath("/api/users/refresh"); // Only sent to refresh endpoint
        cookie.setMaxAge((int) maxAgeSeconds);
        if (!cookieDomain.isEmpty()) {
            cookie.setDomain(cookieDomain);
        }
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    /**
     * Clear auth cookies (for logout)
     */
    public void clearAuthCookies(HttpServletResponse response) {
        if (!useCookies)
            return;

        Cookie accessCookie = new Cookie(ACCESS_TOKEN_COOKIE, "");
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(secureCookies);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie(REFRESH_TOKEN_COOKIE, "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(secureCookies);
        refreshCookie.setPath("/api/users/refresh");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
    }

    /**
     * Extract access token from cookie
     */
    public String extractAccessToken(Cookie[] cookies) {
        if (cookies == null)
            return null;
        for (Cookie cookie : cookies) {
            if (ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /**
     * Extract refresh token from cookie
     */
    public String extractRefreshToken(Cookie[] cookies) {
        if (cookies == null)
            return null;
        for (Cookie cookie : cookies) {
            if (REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
