package com.parking.controller;

import com.parking.model.Vehicle;
import com.parking.repository.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final VehicleRepository repo;
    public VehicleController(VehicleRepository repo){ this.repo = repo; }

    @GetMapping
    public List<Vehicle> all(){ return repo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> get(@PathVariable String id){
        Optional<Vehicle> v = repo.findById(id);
        return v.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle vehicle){ return repo.save(vehicle); }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable String id, @RequestBody Vehicle vehicle){
        return repo.findById(id).map(existing -> {
            vehicle.setId(existing.getId());
            return ResponseEntity.ok(repo.save(vehicle));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id){
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
