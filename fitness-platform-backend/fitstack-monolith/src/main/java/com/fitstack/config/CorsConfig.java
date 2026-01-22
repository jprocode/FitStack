package com.fitstack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // Allow specific origins (local + production)
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:5173",
                                "http://localhost:3000",
                                "https://fitstack-app.vercel.app",
                                "https://fitstack.vercel.app",
                                "https://fit-stack.vercel.app"));

                // Also allow Vercel preview deployments
                configuration.setAllowedOriginPatterns(Arrays.asList(
                                "https://*.vercel.app"));

                // Allow credentials
                configuration.setAllowCredentials(true);

                // Allow specific methods
                configuration.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

                // Allow all headers
                configuration.setAllowedHeaders(List.of("*"));

                // Expose headers
                configuration.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "X-User-Id"));

                // Max age for preflight cache
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }
}
