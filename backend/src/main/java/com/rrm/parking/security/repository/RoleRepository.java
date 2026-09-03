package com.rrm.parking.security.repository;

import com.rrm.parking.security.entity.Role;
import com.rrm.parking.security.enums.CodeRole;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    @EntityGraph(attributePaths = "permissions")
    Optional<Role> findByCode(CodeRole code);

    boolean existsByCode(CodeRole code);
}