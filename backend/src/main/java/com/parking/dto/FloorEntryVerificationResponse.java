package com.parking.dto;

public class FloorEntryVerificationResponse {
    private boolean success;
    private String message;
    private String assignedFloorCode;

    public FloorEntryVerificationResponse() {
    }

    public FloorEntryVerificationResponse(boolean success, String message, String assignedFloorCode) {
        this.success = success;
        this.message = message;
        this.assignedFloorCode = assignedFloorCode;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAssignedFloorCode() {
        return assignedFloorCode;
    }

    public void setAssignedFloorCode(String assignedFloorCode) {
        this.assignedFloorCode = assignedFloorCode;
    }
}
