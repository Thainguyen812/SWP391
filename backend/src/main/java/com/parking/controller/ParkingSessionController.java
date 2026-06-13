package com.parking.controller;

import com.parking.model.ParkingSession;
import com.parking.repository.ParkingSessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sessions")
public class ParkingSessionController {

    private final ParkingSessionRepository repo;

    public ParkingSessionController(ParkingSessionRepository repo) {
        this.repo = repo;
    }

    @GetMapping // Full parking session 
    public List<ParkingSession> getAllSessions() {
        return repo.findAll();
    }

    @GetMapping("/{id}") // xem lẻ từng session mình muốn
    public ResponseEntity<ParkingSession> getSessionById(@PathVariable String id) {
        Optional<ParkingSession> session = repo.findById(id);

        if (session.isPresent()) {
            return ResponseEntity.ok(session.get());
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping // tạo mới parking session
    public ParkingSession createSession(@RequestBody ParkingSession session) {
        return repo.save(session);
    }

    @PutMapping("/{id}") // cập nhật session
    public ResponseEntity<ParkingSession> updateSession(
            @PathVariable String id,
            @RequestBody ParkingSession newSession
    ) {
        Optional<ParkingSession> existingSession = repo.findById(id);

        if (existingSession.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        newSession.setId(id);
        ParkingSession savedSession = repo.save(newSession);

        return ResponseEntity.ok(savedSession);
    }

    @DeleteMapping("/{id}") // xóa parking session
    public ResponseEntity<Void> deleteSession(@PathVariable String id) {
        boolean exists = repo.existsById(id);

        if (!exists) {
            return ResponseEntity.notFound().build();
        }

        repo.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}