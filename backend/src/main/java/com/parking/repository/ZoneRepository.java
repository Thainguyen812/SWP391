package com.parking.repository;

import com.parking.model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ZoneRepository extends JpaRepository<Zone, UUID> {
    List<Zone> findByAllowedSizesContaining(String size);

    @Modifying
    @Query("""
                UPDATE Zone z
                SET z.currentOccupied = z.currentOccupied + 1
                WHERE z.id = :zoneId
            """)
    void increaseOccupied(UUID zoneId);

    @Modifying
    @Query("""
                UPDATE Zone z
                SET z.currentOccupied = z.currentOccupied - 1
                WHERE z.id = :zoneId
            """)
    void decreaseOccupied(UUID zoneId);
}
