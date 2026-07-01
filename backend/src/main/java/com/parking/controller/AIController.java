package com.parking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
public class AIController {

    @PostMapping("/recognize")
    public ResponseEntity<Map<String, Object>> recognizeLicensePlate(
            @RequestParam(value = "image", required = false) MultipartFile image) throws InterruptedException {
        // Simulate processing delay for AI inference
        Thread.sleep(800);

        Map<String, Object> response = new HashMap<>();
        response.put("plate", "30G-" + (int) (Math.random() * 900 + 100) + "." + (int) (Math.random() * 90 + 10));
        response.put("confidence", 98.5);
        response.put("boundingBox", new int[] { 120, 150, 320, 250 }); // [x1, y1, x2, y2]

        return ResponseEntity.ok(response);
    }
}
