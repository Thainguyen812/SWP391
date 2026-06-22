package com.parking.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "branches")
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "branch_name", unique = true, nullable = false)
    private String branchName;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "total_capacity")
    private int totalCapacity = 0;

    @Column(name = "status")
    private String status = "ACTIVE";

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public UUID getManagerId() { return managerId; }
    public void setManagerId(UUID managerId) { this.managerId = managerId; }
    public int getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
