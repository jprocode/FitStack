package com.fitstack.config.exception;

/**
 * Alias for NotFoundException - used by nutrition service
 */
public class ResourceNotFoundException extends NotFoundException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
