package com.parking.dto;

public class HandoverRequest {
    private String nextStaffId;
    private String nextStaffName;
    private String nextShiftType;
    
    private Double systemRevenue;
    private Double systemCash;
    private Double systemTransfer;
    private Double declaredCash;
    private Integer vehiclesHandled;

    // Getters and Setters
    public String getNextStaffId() { return nextStaffId; }
    public void setNextStaffId(String nextStaffId) { this.nextStaffId = nextStaffId; }
    public String getNextStaffName() { return nextStaffName; }
    public void setNextStaffName(String nextStaffName) { this.nextStaffName = nextStaffName; }
    public String getNextShiftType() { return nextShiftType; }
    public void setNextShiftType(String nextShiftType) { this.nextShiftType = nextShiftType; }
    public Double getSystemRevenue() { return systemRevenue; }
    public void setSystemRevenue(Double systemRevenue) { this.systemRevenue = systemRevenue; }
    public Double getSystemCash() { return systemCash; }
    public void setSystemCash(Double systemCash) { this.systemCash = systemCash; }
    public Double getSystemTransfer() { return systemTransfer; }
    public void setSystemTransfer(Double systemTransfer) { this.systemTransfer = systemTransfer; }
    public Double getDeclaredCash() { return declaredCash; }
    public void setDeclaredCash(Double declaredCash) { this.declaredCash = declaredCash; }
    public Integer getVehiclesHandled() { return vehiclesHandled; }
    public void setVehiclesHandled(Integer vehiclesHandled) { this.vehiclesHandled = vehiclesHandled; }
}
