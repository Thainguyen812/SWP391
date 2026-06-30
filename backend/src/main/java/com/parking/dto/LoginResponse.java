package com.parking.dto;

import com.parking.model.User;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;
    private boolean requiresOtp;
    private String email;
    private String message;

    public LoginResponse(String accessToken, String refreshToken, User u) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        if (u != null) {
            this.user = new UserDto(u);
        }
        this.requiresOtp = false;
    }

    public LoginResponse(boolean requiresOtp, String email, String message) {
        this.requiresOtp = requiresOtp;
        this.email = email;
        this.message = message;
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public UserDto getUser() { return user; }
    public boolean getRequiresOtp() { return requiresOtp; }
    public String getEmail() { return email; }
    public String getMessage() { return message; }

    public static class UserDto {
        private String id;
        private String username;
        private String fullName;
        private String role;
        private String email;
        private String phone;

        public UserDto(User u) {
            this.id = u.getId().toString();
            this.username = u.getUsername();
            this.fullName = u.getFullName();
            this.role = u.getRole() != null ? u.getRole().name() : null;
            this.email = u.getEmail();
            this.phone = u.getPhone();
        }

        public String getId() { return id; }
        public String getUsername() { return username; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
    }
}
