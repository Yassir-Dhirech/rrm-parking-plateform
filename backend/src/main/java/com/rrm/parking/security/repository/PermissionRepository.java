package com.rrm.parking.security.repository;

import com.rrm.parking.security.entity.Permission;
import com.rrm.parking.security.enums.CodePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository
        extends JpaRepository<Permission, Long> {

    Optional<Permission> findByCode(CodePermission code);

    boolean existsByCode(CodePermission code);
}