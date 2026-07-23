package com.parking.repository;

import com.parking.model.RbacPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RbacPermissionRepository extends JpaRepository<RbacPermission, UUID> {
    RbacPermission findByModuleKey(String moduleKey);
}
