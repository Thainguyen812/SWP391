package com.parking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shift_history")
public class ShiftHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "staff_name", nullable = false)
    private String staffName;

    @Column(name = "shift_type", nullable = false)
    private String shiftType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "vehicles_handled")
    private Integer vehiclesHandled;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "is_current")
    private Boolean isCurrent;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }
    public String getShiftType() { return shiftType; }
    public void setShiftType(String shiftType) { this.shiftType = shiftType; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Integer getVehiclesHandled() { return vehiclesHandled; }
    public void setVehiclesHandled(Integer vehiclesHandled) { this.vehiclesHandled = vehiclesHandled; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getIsCurrent() { return isCurrent; }
    public void setIsCurrent(Boolean isCurrent) { this.isCurrent = isCurrent; }
}
