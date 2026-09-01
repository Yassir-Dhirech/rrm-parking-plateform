package com.rrm.parking.audit.repository;

import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface AuditLogRepository
        extends Repository<AuditLog, Long> {

    AuditLog save(AuditLog auditLog);

    Optional<AuditLog> findById(Long id);

    long count();

    Page<AuditLog> findAllByOrderByDateEvenementDesc(
            Pageable pageable
    );

    Page<AuditLog>
    findByActeurIdOrderByDateEvenementDesc(
            Long acteurId,
            Pageable pageable
    );

    Page<AuditLog>
    findByParkingIdOrderByDateEvenementDesc(
            Long parkingId,
            Pageable pageable
    );

    Page<AuditLog>
    findByTypeActionOrderByDateEvenementDesc(
            TypeActionAudit typeAction,
            Pageable pageable
    );

    Page<AuditLog>
    findByResultatOrderByDateEvenementDesc(
            ResultatAudit resultat,
            Pageable pageable
    );

    Page<AuditLog>
    findByTypeObjetAndObjetIdOrderByDateEvenementDesc(
            String typeObjet,
            Long objetId,
            Pageable pageable
    );

    Page<AuditLog>
    findByCorrelationIdOrderByDateEvenementDesc(
            String correlationId,
            Pageable pageable
    );
}