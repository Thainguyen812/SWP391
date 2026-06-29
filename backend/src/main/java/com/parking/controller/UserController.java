package com.parking.controller;

import com.parking.model.User;
import com.parking.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder; // 1. Khai báo thêm PasswordEncoder

    public UserController(UserRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<User> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> get(@PathVariable UUID id) {
        Optional<User> u = repo.findById(id);
        return u.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 3. SỬA API CREATE: Mã hóa mật khẩu trước khi lưu
    @PostMapping
    public User create(@RequestBody User user) {
        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(user.getPasswordHash());
            user.setPasswordHash(encodedPassword);
        }
        return repo.save(user);
    }

    // 4. SỬA API UPDATE: Kiểm tra và mã hóa mật khẩu nếu có thay đổi
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable UUID id, @RequestBody User user) {
        return repo.findById(id).map(existing -> {
            user.setId(existing.getId());

            // Nếu Frontend gửi lên mật khẩu mới (không trống) -> Mã hóa nó
            if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
                user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
            } else {
                // Nếu Frontend không truyền mật khẩu mới, giữ nguyên mật khẩu cũ trong DB
                user.setPasswordHash(existing.getPasswordHash());
            }

            return ResponseEntity.ok(repo.save(user));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
