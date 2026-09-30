package com.rrm.parking.carte.corporate;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EcheanceCarteCorporateRepository extends JpaRepository<EcheanceCarteCorporate, Long> {
    Optional<EcheanceCarteCorporate> findByCarteIdAndActivationReference(Long carteId, LocalDateTime activationReference);
    Optional<EcheanceCarteCorporate> findByOperationId(Long operationId);
    List<EcheanceCarteCorporate> findByCarteIdOrderByActivationReferenceDesc(Long carteId);
    List<EcheanceCarteCorporate> findAllByOrderByDateEcheanceDesc();
}
