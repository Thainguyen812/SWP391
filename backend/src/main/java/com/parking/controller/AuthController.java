package com.parking.controller;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
import com.parking.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req){
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest req){
        return ResponseEntity.status(201).body(authService.register(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody String refreshToken){
        String access = authService.refresh(refreshToken.replace("\"",""));
        return ResponseEntity.ok(new LoginResponse(access, refreshToken));
    }
}
