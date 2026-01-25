package com.fitstack.user.dto;

import lombok.Data;

@Data
public class DeleteAccountRequest {
    // Confirmation text is optional - frontend uses "delete-my-account" phrase
    // Password validation has been removed to support OAuth users
    private String confirmationText;
}
