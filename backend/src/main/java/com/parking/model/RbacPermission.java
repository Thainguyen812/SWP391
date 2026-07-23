package com.parking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "rbac_permissions")
public class RbacPermission {
    
    @Id
    private UUID id;
    
    private String moduleKey;
    private String moduleName;
    private boolean managerAccess;
    private boolean staffAccess;

    // Constructors
    public RbacPermission() {}

    public RbacPermission(UUID id, String moduleKey, String moduleName, boolean managerAccess, boolean staffAccess) {
        this.id = id;
        this.moduleKey = moduleKey;
        this.moduleName = moduleName;
        this.managerAccess = managerAccess;
        this.staffAccess = staffAccess;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getModuleKey() {
        return moduleKey;
    }

    public void setModuleKey(String moduleKey) {
        this.moduleKey = moduleKey;
    }

    public String getModuleName() {
        return moduleName;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }

    public boolean isManagerAccess() {
        return managerAccess;
    }

    public void setManagerAccess(boolean managerAccess) {
        this.managerAccess = managerAccess;
    }

    public boolean isStaffAccess() {
        return staffAccess;
    }

    public void setStaffAccess(boolean staffAccess) {
        this.staffAccess = staffAccess;
    }
}
