package com.parking.service.impl;

import com.parking.dto.RegisterRequest;
import com.parking.model.User;
import com.parking.repository.UserRepository;
import com.parking.service.PersonnelService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class PersonnelServiceImpl implements PersonnelService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PersonnelServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User createPersonnel(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập (username) này đã tồn tại!");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }

        String roleInput = request.getRole() != null ? request.getRole().toUpperCase() : "";
        if (!roleInput.equals("STAFF") && !roleInput.equals("MANAGER")) {
            throw new RuntimeException("Chỉ được phép tạo nhân sự với quyền STAFF hoặc MANAGER!");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone()); 

        // 1. Mã hóa mật khẩu
        String encryptedPassword = passwordEncoder.encode(request.getPassword());
        user.setPassword(encryptedPassword);

        // 2. Ép kiểu String thành Enum tương ứng của hệ thống bạn (STAFF hoặc MANAGER)
        // Lưu ý: Nếu tên Enum của bạn khác (ví dụ: UserRole.STAFF), bạn thay chữ User.Role tương ứng nhé
        try {
            user.setRole(User.Role.valueOf(roleInput)); 
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Lỗi gán quyền hệ thống!");
        }

        // Mặc định cho tài khoản mới active (nếu thực thể User của bạn có Enum Status)
        try {
            user.setStatus(User.Status.ACTIVE);
        } catch (Exception e) {
            // Bỏ qua nếu không có trường này hoặc tên Enum khác
        }

        return userRepository.save(user);
    }
}