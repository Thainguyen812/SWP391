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
        createOrUpdateAccount("staffdemo9@gmail.com", "123456", User.Role.STAFF, "Staff Demo");
        createOrUpdateAccount("managerdemo626@gmail.com", "123456", User.Role.MANAGER, "Manager Demo");
        createOrUpdateAccount("admindemo8@gmail.com", "123456", User.Role.ADMIN, "Admin Demo");
    }

    private void createOrUpdateAccount(String email, String password, User.Role role, String fullName) {
        User user = userRepository.findByUsername(email).orElse(new User());
        
        if (user.getId() == null) {
            user.setId(UUID.randomUUID());
            user.setUsername(email);
            user.setEmail(email);
            user.setRole(role);
            user.setFullName(fullName);
            user.setStatus(User.Status.ACTIVE);
            user.setCreatedAt(Instant.now());
        }
        
        // Luôn luôn cập nhật mật khẩu mới nhất (nếu thay đổi)
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
        System.out.println("Tạo/Cập nhật tài khoản thành công: " + email);
    }
}
