package com.parking.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "blacklisted_cards")
public class BlacklistEntry {
    @Id
    private UUID id;

    @Column(name = "card_id", nullable = false)
    private UUID cardId;

    @Column(name = "session_id")
    private UUID sessionId;

    @Column(nullable = false)
    private String reason;

    @Column(name = "blacklisted_by", nullable = false)
    private UUID blacklistedBy;

    @Column(name = "blacklisted_at")
    private java.time.Instant blacklistedAt;

    private String notes;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getCardId() { return cardId; }
    public void setCardId(UUID cardId) { this.cardId = cardId; }
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public UUID getBlacklistedBy() { return blacklistedBy; }
    public void setBlacklistedBy(UUID blacklistedBy) { this.blacklistedBy = blacklistedBy; }
    public java.time.Instant getBlacklistedAt() { return blacklistedAt; }
    public void setBlacklistedAt(java.time.Instant blacklistedAt) { this.blacklistedAt = blacklistedAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
