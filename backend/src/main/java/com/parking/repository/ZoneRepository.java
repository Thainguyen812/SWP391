package com.parking.repository;

import com.parking.model.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface ZoneRepository extends JpaRepository<Zone, UUID> {


    @Query(value = "SELECT * FROM zones WHERE allowed_sizes @> CAST(CONCAT('[\"', :size, '\"]') AS jsonb)", nativeQuery = true)
    List<Zone> findByAllowedSizesContaining(@Param("size") String size);


    @Modifying
    @Query("UPDATE Zone z SET z.currentOccupied = z.currentOccupied + 1 WHERE z.id = :zoneId")
    void increaseOccupied(UUID zoneId);

    @Modifying
    @Query("UPDATE Zone z SET z.currentOccupied = z.currentOccupied - 1 WHERE z.id = :zoneId")
    void decreaseOccupied(UUID zoneId);
}