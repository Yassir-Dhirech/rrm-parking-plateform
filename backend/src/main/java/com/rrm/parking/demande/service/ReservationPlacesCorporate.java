package com.rrm.parking.demande.service;

import com.rrm.parking.demande.enums.StatutDemande;

import java.util.Set;

/** Une demande corporate réserve ses places dès la validation du responsable. */
public final class ReservationPlacesCorporate {

    public static final Set<StatutDemande> STATUTS_RESERVANT = Set.of(
            StatutDemande.VALIDEE,
            StatutDemande.EN_ATTENTE_PAIEMENT_SIGNATURE,
            StatutDemande.EN_ATTENTE_RETOUR_CONTRAT_LEGALISE,
            StatutDemande.EN_ATTENTE_FACTURATION,
            StatutDemande.EN_PREPARATION_CARTES,
            StatutDemande.PRETE_A_FINALISER,
            StatutDemande.FINALISEE
    );

    private ReservationPlacesCorporate() {
    }
}
