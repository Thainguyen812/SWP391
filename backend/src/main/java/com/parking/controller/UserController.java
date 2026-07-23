package com.parking.controller;

import com.parking.model.User;
import com.parking.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'STAFF')")
public class UserController {
    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
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

    @PostMapping
    public User create(@RequestBody User user) {
        return repo.save(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable UUID id, @RequestBody User user) {
        return repo.findById(id).map(existing -> {
            user.setId(existing.getId());
            return ResponseEntity.ok(repo.save(user));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
