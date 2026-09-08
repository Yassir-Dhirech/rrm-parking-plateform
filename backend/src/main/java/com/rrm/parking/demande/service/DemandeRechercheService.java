package com.rrm.parking.demande.service;

import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DemandeRechercheService {

    private final DemandeClientRepository
            demandeClientRepository;

    private final ClientParticulierRepository
            clientParticulierRepository;

    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse> rechercher(
            String reference,
            String cin
    ) {
        boolean referenceRenseignee =
                estRenseignee(reference);

        boolean cinRenseigne =
                estRenseignee(cin);

        if (referenceRenseignee == cinRenseigne) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Renseignez soit la référence, soit la CIN"
            );
        }

        if (referenceRenseignee) {
            return rechercherParReference(reference);
        }

        return rechercherParCin(cin);
    }

    private List<DemandeRechercheResponse>
    rechercherParReference(
            String reference
    ) {
        String referenceNormalisee =
                reference
                        .trim()
                        .toUpperCase(Locale.ROOT);

        DemandeClient demande =
                demandeClientRepository
                        .findByReferenceIgnoreCase(
                                referenceNormalisee
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Demande introuvable"
                                )
                        );

        return List.of(
                DemandeRechercheResponse.depuis(
                        demande
                )
        );
    }

    private List<DemandeRechercheResponse>
    rechercherParCin(
            String cin
    ) {
        String cinNormalisee =
                cin
                        .trim()
                        .toUpperCase(Locale.ROOT);

        ClientParticulier client =
                clientParticulierRepository
                        .findByCinIgnoreCase(
                                cinNormalisee
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Aucun client trouvé pour cette CIN"
                                )
                        );

        List<DemandeRechercheResponse> demandes =
                demandeClientRepository
                        .findByClientIdOrderByDateSoumissionDesc(
                                client.getId()
                        )
                        .stream()
                        .map(DemandeRechercheResponse::depuis)
                        .toList();

        if (demandes.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Aucune demande trouvée pour cette CIN"
            );
        }

        return demandes;
    }

    @Transactional(readOnly = true)
    public List<DemandeRechercheResponse>
    listerDemandesEnAttentePaiement() {

        return demandeClientRepository
                .findByStatutOrderByDateValidationOtpAsc(
                        StatutDemande.EN_ATTENTE_PAIEMENT
                )
                .stream()
                .map(DemandeRechercheResponse::depuis)
                .toList();
    }

    private boolean estRenseignee(
            String valeur
    ) {
        return valeur != null
                && !valeur.isBlank();
    }
}