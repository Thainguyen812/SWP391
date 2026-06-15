package com.parking.service;

import com.parking.dto.LoginRequest;
import com.parking.dto.LoginResponse;
import com.parking.dto.RegisterRequest;
import com.parking.model.RefreshToken;
import com.parking.model.User;
import com.parking.repository.RefreshTokenRepository;
import com.parking.repository.UserRepository;
import com.parking.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepo;
    private final RefreshTokenRepository refreshRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepo, RefreshTokenRepository refreshRepo, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepo = userRepo;
        this.refreshRepo = refreshRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public LoginResponse login(LoginRequest req){
        Optional<User> uOpt = userRepo.findByUsername(req.getUsername());
        if (uOpt.isEmpty()) throw new RuntimeException("Invalid credentials");
        User u = uOpt.get();
        if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) throw new RuntimeException("Invalid credentials");
        String access = jwtUtils.generateJwtToken(u.getUsername());
        UUID refreshUuid = UUID.randomUUID();
        RefreshToken rt = new RefreshToken();
        rt.setId(UUID.randomUUID());
        rt.setUserId(u.getId());
        rt.setToken(refreshUuid);
        rt.setExpiresAt(Instant.now().plusSeconds(7*24*3600));
        refreshRepo.save(rt);
        return new LoginResponse(access, refreshUuid.toString());
    }

    public LoginResponse register(RegisterRequest req){
        User u = new User();
        u.setId(UUID.randomUUID());
        u.setUsername(req.getUsername());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setFullName(req.getFullName());
        u.setEmail(req.getEmail());
        u.setRole(User.Role.DRIVER);
        userRepo.save(u);
        // auto login
        LoginRequest lr = new LoginRequest(); lr.setUsername(req.getUsername()); lr.setPassword(req.getPassword());
        return login(lr);
    }

    public String refresh(String refreshToken){
        UUID tokenUuid = UUID.fromString(refreshToken);
        Optional<RefreshToken> opt = refreshRepo.findByToken(tokenUuid);
        if (opt.isEmpty()) throw new RuntimeException("Invalid refresh token");
        RefreshToken rt = opt.get();
        if (rt.getExpiresAt().isBefore(Instant.now())) { refreshRepo.delete(rt); throw new RuntimeException("Refresh token expired"); }
        Optional<User> uOpt = userRepo.findById(rt.getUserId());
        if (uOpt.isEmpty()) throw new RuntimeException("User not found");
        String access = jwtUtils.generateJwtToken(uOpt.get().getUsername());
        return access;
    }
}
