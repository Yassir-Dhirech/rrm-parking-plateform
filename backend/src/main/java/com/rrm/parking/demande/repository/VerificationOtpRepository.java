package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.VerificationOtp;
import com.rrm.parking.demande.enums.StatutOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VerificationOtpRepository
        extends JpaRepository<VerificationOtp, Long> {

    List<VerificationOtp> findByDemandeId(Long demandeId);

    Optional<VerificationOtp> findFirstByDemandeIdAndStatut(
            Long demandeId,
            StatutOtp statut
    );
}