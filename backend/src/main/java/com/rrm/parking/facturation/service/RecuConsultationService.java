package com.rrm.parking.facturation.service;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.facturation.dto.response.RecuConsultationResponse;
import com.rrm.parking.facturation.entity.Recu;
import com.rrm.parking.facturation.repository.RecuRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecuConsultationService {

    private final RecuRepository recuRepository;

    private final ClientParticulierRepository
            clientParticulierRepository;

    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public RecuConsultationResponse consulter(
            Long recuId
    ) {
        Recu recu = recuRepository
                .findById(recuId)
                .orElseThrow(() ->
                        new RessourceIntrouvableException(
                                "Reçu introuvable"
                        )
                );

        Long demandeId = recu
                .getPaiement()
                .getDemande()
                .getId();

        Long clientId = recu
                .getPaiement()
                .getDemande()
                .getClient()
                .getId();

        ClientParticulier client =
                clientParticulierRepository
                        .findById(clientId)
                        .orElseThrow(() ->
                                new RessourceIntrouvableException(
                                        "Client particulier introuvable"
                                )
                        );

        DemandeNouvelAbonnementRegulier
                demandeReguliere = entityManager.find(
                DemandeNouvelAbonnementRegulier.class,
                demandeId
        );

        if (demandeReguliere == null) {
            throw new RessourceIntrouvableException(
                    "Demande d'abonnement régulier introuvable"
            );
        }

        return RecuConsultationResponse.depuis(
                recu,
                client,
                demandeReguliere
        );
    }
}