package com.rrm.parking.demande.repository;

import com.rrm.parking.demande.entity.VerificationOtp;
import com.rrm.parking.demande.enums.StatutOtp;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

public interface VerificationOtpRepository
        extends JpaRepository<VerificationOtp, Long> {

    List<VerificationOtp> findByDemandeId(
            Long demandeId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<VerificationOtp>
    findFirstByDemandeIdAndStatutOrderByDateCreationDesc(
            Long demandeId,
            StatutOtp statut
    );
}