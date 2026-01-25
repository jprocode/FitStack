package com.fitstack.user.service;

import com.fitstack.user.entity.User;
import com.fitstack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // OAuth users have null passwordHash - use empty string as placeholder
        // (authentication for OAuth users is handled via token, not password)
        String password = user.getPasswordHash() != null ? user.getPasswordHash() : "";

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                password,
                new ArrayList<>());
    }
}
