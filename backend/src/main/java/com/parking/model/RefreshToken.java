package com.parking.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @Column(length = 36)
    private String id;

    @Column(length = 36)
    private String userId;

    @Column(length = 36, unique = true)
    private String token;

    private Instant expiresAt;

    // getters/setters
    public String getId(){ return id; }
    public void setId(String id){ this.id = id; }
    public String getUserId(){ return userId; }
    public void setUserId(String userId){ this.userId = userId; }
    public String getToken(){ return token; }
    public void setToken(String token){ this.token = token; }
    public Instant getExpiresAt(){ return expiresAt; }
    public void setExpiresAt(Instant expiresAt){ this.expiresAt = expiresAt; }
}
