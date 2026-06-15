package com.parking.dto;

import com.parking.model.User;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;

    public LoginResponse(String accessToken, String refreshToken, User u) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        if (u != null) {
            this.user = new UserDto(u);
        }
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public UserDto getUser() { return user; }

    public static class UserDto {
        private String id;
        private String username;
        private String fullName;
        private String role;

        public UserDto(User u) {
            this.id = u.getId().toString();
            this.username = u.getUsername();
            this.fullName = u.getFullName();
            this.role = u.getRole() != null ? u.getRole().name() : null;
        }

        public String getId() { return id; }
        public String getUsername() { return username; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
    }
}
