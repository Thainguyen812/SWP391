package com.parking.config;

import com.parking.model.User;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAccountIfNotFound("staffdemo9@gmail.com", "Staff@0812", User.Role.STAFF, "Staff Demo");
        createAccountIfNotFound("managerdemo626@gmail.com", "Manager@0812", User.Role.MANAGER, "Manager Demo");
        createAccountIfNotFound("admindemo8@gmail.com", "Admin@0812", User.Role.ADMIN, "Admin Demo");
    }

    private void createAccountIfNotFound(String email, String password, User.Role role, String fullName) {
        if (userRepository.findByUsername(email).isEmpty()) {
            User user = new User();
            user.setId(UUID.randomUUID());
            user.setUsername(email);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole(role);
            user.setFullName(fullName);
            user.setStatus(User.Status.ACTIVE);
            user.setCreatedAt(Instant.now());
            userRepository.save(user);
            System.out.println("Tạo tài khoản thành công: " + email);
        }
    }
}
