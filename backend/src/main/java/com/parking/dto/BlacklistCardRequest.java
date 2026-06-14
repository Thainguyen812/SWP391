package com.parking.dto;

import java.util.UUID;

public class BlacklistCardRequest {
    private UUID cardId;
    private UUID sessionId;
    private String reason;
    private UUID blacklistedBy;
    private String notes;

    public UUID getCardId() { return cardId; }
    public void setCardId(UUID cardId) { this.cardId = cardId; }

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public UUID getBlacklistedBy() { return blacklistedBy; }
    public void setBlacklistedBy(UUID blacklistedBy) { this.blacklistedBy = blacklistedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}