package com.fitstack.workout.config;

import com.fitstack.user.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Intercepts WebSocket handshake requests to validate JWT tokens.
 * Token can be passed as query parameter: ?token=xxx
 * Or as Authorization header: Bearer xxx
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {
        String token = extractToken(request);

        if (token == null) {
            log.warn("WebSocket connection rejected: No token provided");
            return false;
        }

        try {
            String email = jwtUtil.extractEmail(token);
            Long userId = jwtUtil.extractUserId(token);

            if (email == null || userId == null) {
                log.warn("WebSocket connection rejected: Invalid token claims");
                return false;
            }

            // Check if token is expired
            if (jwtUtil.extractExpiration(token).before(new java.util.Date())) {
                log.warn("WebSocket connection rejected: Token expired");
                return false;
            }

            // Store user info in WebSocket session attributes
            attributes.put("userId", userId);
            attributes.put("email", email);

            log.debug("WebSocket connection authorized for user {}", userId);
            return true;

        } catch (Exception e) {
            log.warn("WebSocket connection rejected: Token validation failed - {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // No action needed after handshake
    }

    private String extractToken(ServerHttpRequest request) {
        // Try query parameter first: ws://host/ws/workout?token=xxx
        if (request instanceof ServletServerHttpRequest servletRequest) {
            String token = servletRequest.getServletRequest().getParameter("token");
            if (token != null && !token.isEmpty()) {
                return token;
            }
        }

        // Try Authorization header: Bearer xxx
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }
}
