package com.rrm.parking.paiement.service;

import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.facturation.entity.Recu;
import com.rrm.parking.facturation.repository.RecuRepository;
import com.rrm.parking.paiement.dto.request.EnregistrementPaiementRequest;
import com.rrm.parking.paiement.dto.response.EnregistrementPaiementResponse;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.event.PaiementConfirmeEvent;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.tarification.model.DecompteNouvelAbonnement;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final DemandeClientRepository demandeClientRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final RecuRepository recuRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public EnregistrementPaiementResponse enregistrer(
            Long demandeId,
            EnregistrementPaiementRequest requete,
            Long agentId
    ) {
        if (requete == null) {
            throw new IllegalArgumentException(
                    "Les informations du paiement sont obligatoires"
            );
        }

        DemandeClient demande = demandeClientRepository
                .findByIdPourMiseAJour(demandeId)
                .orElseThrow(() ->
                        new RessourceIntrouvableException(
                                "Demande introuvable"
                        )
                );

        if (!(demande instanceof DemandeNouvelAbonnementRegulier demandeReguliere)) {
            throw new ConflitMetierException(
                    "Ce type de demande n'est pas encore pris en charge pour le paiement"
            );
        }

        if (demande.getStatut() != StatutDemande.EN_ATTENTE_PAIEMENT) {
            throw new ConflitMetierException(
                    "La demande doit être en attente de paiement"
            );
        }

        if (paiementRepository.existsByDemandeIdAndStatut(
                demandeId,
                StatutPaiement.CONFIRME
        )) {
            throw new ConflitMetierException(
                    "Un paiement confirmé existe déjà pour cette demande"
            );
        }

        Utilisateur agent = utilisateurRepository
                .findById(agentId)
                .orElseThrow(() ->
                        new RessourceIntrouvableException(
                                "Utilisateur authentifié introuvable"
                        )
                );

        ModePaiement modePaiement =
                demandeReguliere.getModePaiementSouhaite();

        BigDecimal montant = DecompteNouvelAbonnement
                .depuis(demandeReguliere.getTarifParking())
                .montantTotalTTC();

        Paiement paiement = creerPaiement(
                modePaiement,
                demande,
                montant,
                requete
        );

        paiement.confirmer(agent);
        demande.marquerPayee(agent);

        Paiement paiementEnregistre =
                paiementRepository.save(paiement);

        Recu recu = recuRepository.save(
                new Recu(
                        genererNumeroRecu(),
                        paiementEnregistre
                )
        );

        eventPublisher.publishEvent(
                new PaiementConfirmeEvent(recu.getId())
        );

        return EnregistrementPaiementResponse.depuis(
                paiementEnregistre,
                recu
        );
    }

    private Paiement creerPaiement(
            ModePaiement modePaiement,
            DemandeClient demande,
            BigDecimal montant,
            EnregistrementPaiementRequest requete
    ) {
        String reference = genererReferencePaiement();

        if (modePaiement == ModePaiement.ESPECE) {
            verifierAbsenceInformationsCheque(requete);

            return Paiement.creerPaiementEspece(
                    reference,
                    demande,
                    montant
            );
        }

        if (modePaiement == ModePaiement.CHEQUE) {
            return Paiement.creerPaiementCheque(
                    reference,
                    demande,
                    montant,
                    requete.numeroCheque(),
                    requete.banqueCheque(),
                    requete.dateEmissionCheque()
            );
        }

        throw new ConflitMetierException(
                "Mode de paiement non pris en charge"
        );
    }

    private void verifierAbsenceInformationsCheque(
            EnregistrementPaiementRequest requete
    ) {
        if (textePresent(requete.numeroCheque())
                || textePresent(requete.banqueCheque())
                || requete.dateEmissionCheque() != null) {
            throw new IllegalArgumentException(
                    "Un paiement en espèces ne doit pas contenir d'informations de chèque"
            );
        }
    }

    private boolean textePresent(String valeur) {
        return valeur != null && !valeur.isBlank();
    }

    private String genererReferencePaiement() {
        String date = LocalDate.now().format(
                DateTimeFormatter.BASIC_ISO_DATE
        );

        String reference;

        do {
            reference = "PAY-"
                    + date
                    + "-"
                    + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (paiementRepository.existsByReference(reference));

        return reference;
    }

    private String genererNumeroRecu() {
        String date = LocalDate.now().format(
                DateTimeFormatter.BASIC_ISO_DATE
        );

        String numero;

        do {
            numero = "REC-"
                    + date
                    + "-"
                    + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (recuRepository.existsByNumero(numero));

        return numero;
    }
}
