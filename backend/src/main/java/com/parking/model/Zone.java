package com.parking.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "zones")
public class Zone {
    @Id
    private UUID id;

    @Column(name = "zone_name", nullable = false)
    private String zoneName;

    @Column(name = "zone_code", unique = true, nullable = false)
    private String code;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "allowed_sizes", nullable = false)
    private String allowedSizes;

    @Column(name = "total_slots", nullable = false)
    private int totalSlots;

    @Column(name = "current_occupied", nullable = false)
    private int currentOccupied;

    @Column(name = "has_ev_charger", nullable = false)
    private boolean hasEvCharger;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getAllowedSizes() { return allowedSizes; }
    public void setAllowedSizes(String allowedSizes) { this.allowedSizes = allowedSizes; }
    public int getTotalSlots() { return totalSlots; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }
    public int getCurrentOccupied() { return currentOccupied; }
    public void setCurrentOccupied(int currentOccupied) { this.currentOccupied = currentOccupied; }
    public boolean isHasEvCharger() { return hasEvCharger; }
    public void setHasEvCharger(boolean hasEvCharger) { this.hasEvCharger = hasEvCharger; }
}
