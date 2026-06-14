package com.parking.dto;

public class CheckInResponse {
    private String session_id;
    private String assigned_zone_code;
    private String message;

    public CheckInResponse() {}
    public CheckInResponse(String session_id, String assigned_zone_code, String message) {
        this.session_id = session_id;
        this.assigned_zone_code = assigned_zone_code;
        this.message = message;
    }

    public String getSession_id() { return session_id; }
    public void setSession_id(String session_id) { this.session_id = session_id; }
    public String getAssigned_zone_code() { return assigned_zone_code; }
    public void setAssigned_zone_code(String assigned_zone_code) { this.assigned_zone_code = assigned_zone_code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
