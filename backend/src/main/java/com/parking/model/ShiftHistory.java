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

    @Column(name = "system_revenue", columnDefinition = "numeric(19, 2)")
    private Double systemRevenue;

    @Column(name = "system_cash", columnDefinition = "numeric(19, 2)")
    private Double systemCash;

    @Column(name = "system_transfer", columnDefinition = "numeric(19, 2)")
    private Double systemTransfer;

    @Column(name = "declared_cash", columnDefinition = "numeric(19, 2)")
    private Double declaredCash;

    @Column(name = "next_staff_id")
    private String nextStaffId;

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
    public Double getSystemRevenue() { return systemRevenue; }
    public void setSystemRevenue(Double systemRevenue) { this.systemRevenue = systemRevenue; }
    public Double getSystemCash() { return systemCash; }
    public void setSystemCash(Double systemCash) { this.systemCash = systemCash; }
    public Double getSystemTransfer() { return systemTransfer; }
    public void setSystemTransfer(Double systemTransfer) { this.systemTransfer = systemTransfer; }
    public Double getDeclaredCash() { return declaredCash; }
    public void setDeclaredCash(Double declaredCash) { this.declaredCash = declaredCash; }
    public String getNextStaffId() { return nextStaffId; }
    public void setNextStaffId(String nextStaffId) { this.nextStaffId = nextStaffId; }
}
