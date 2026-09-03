package com.rrm.parking.client.repository;

import com.rrm.parking.client.entity.ClientEntreprise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientEntrepriseRepository
        extends JpaRepository<ClientEntreprise, Long> {

    Optional<ClientEntreprise> findByIce(String ice);

    boolean existsByIce(String ice);
}