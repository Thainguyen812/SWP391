package com.parking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/camera")
public class CameraController {

    @GetMapping("/stream/{cameraId}")
    public ResponseEntity<Map<String, String>> getCameraStream(@PathVariable String cameraId) {
        Map<String, String> response = new HashMap<>();
        // Mock returning a static video loop or MJPEG stream URL
        response.put("cameraId", cameraId);
        response.put("url", "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80");
        response.put("status", "ACTIVE");
        return ResponseEntity.ok(response);
    }
}
