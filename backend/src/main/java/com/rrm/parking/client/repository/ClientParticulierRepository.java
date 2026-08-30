package com.rrm.parking.client.repository;

import com.rrm.parking.client.entity.ClientParticulier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientParticulierRepository
        extends JpaRepository<ClientParticulier, Long> {

    Optional<ClientParticulier> findByCinIgnoreCase(String cin);

    boolean existsByCinIgnoreCase(String cin);
}