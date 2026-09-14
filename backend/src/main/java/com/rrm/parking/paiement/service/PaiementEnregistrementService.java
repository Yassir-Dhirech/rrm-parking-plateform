package com.rrm.parking.paiement.service;

import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.facturation.entity.Recu;
import com.rrm.parking.facturation.repository.RecuRepository;
import com.rrm.parking.paiement.dto.request.EnregistrerPaiementRequest;
import com.rrm.parking.paiement.dto.response.PaiementEnregistreResponse;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import com.rrm.parking.paiement.repository.PaiementRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaiementEnregistrementService {

    private static final BigDecimal PRIX_CARTE_TTC =
            new BigDecimal("50.00");

    private final DemandeClientRepository demandeClientRepository;
    private final PaiementRepository paiementRepository;
    private final RecuRepository recuRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional
    public PaiementEnregistreResponse enregistrer(
            Long demandeId,
            EnregistrerPaiementRequest requete,
            Long utilisateurId
    ) {
        DemandeClient demande = demandeClientRepository
                .findByIdPourPaiement(demandeId)
                .orElseThrow(() ->
                        new RessourceIntrouvableException(
                                "Demande introuvable"
                        )
                );

        verifierDemandePayable(demande);

        Utilisateur agent = utilisateurRepository
                .findById(utilisateurId)
                .orElseThrow(() ->
                        new RessourceIntrouvableException(
                                "Utilisateur introuvable"
                        )
                );

        DemandeNouvelAbonnementRegulier demandeReguliere =
                obtenirDemandeReguliere(demande);

        demandeReguliere.choisirModePaiement(
                requete.modePaiement()
        );

        BigDecimal montant =
                calculerMontant(demandeReguliere);

        Paiement paiement = creerPaiement(
                demande,
                montant,
                requete
        );

        paiement.confirmer(agent);
        paiement = paiementRepository.save(paiement);

        demande.marquerPayee(agent);
        demandeClientRepository.save(demande);

        Recu recu = new Recu(
                genererReference("REC"),
                paiement
        );

        recu = recuRepository.save(recu);

        return PaiementEnregistreResponse.depuis(
                paiement,
                recu
        );
    }

    private void verifierDemandePayable(
            DemandeClient demande
    ) {
        if (demande.getStatut()
                != StatutDemande.EN_ATTENTE_PAIEMENT) {

            throw new ConflitMetierException(
                    "La demande n'est pas en attente de paiement"
            );
        }

        boolean paiementDejaConfirme =
                paiementRepository
                        .existsByDemandeIdAndStatut(
                                demande.getId(),
                                StatutPaiement.CONFIRME
                        );

        if (paiementDejaConfirme) {
            throw new ConflitMetierException(
                    "Un paiement est déjà confirmé pour cette demande"
            );
        }
    }

    private DemandeNouvelAbonnementRegulier
    obtenirDemandeReguliere(
            DemandeClient demande
    ) {
        if (demande
                instanceof DemandeNouvelAbonnementRegulier reguliere) {
            return reguliere;
        }

        throw new IllegalArgumentException(
                "Ce type de demande n'est pas encore pris en charge"
        );
    }

    private BigDecimal calculerMontant(
            DemandeNouvelAbonnementRegulier demande
    ) {
        BigDecimal montantAbonnement =
                demande
                        .getTarifParking()
                        .calculerMontantTotalTTC();

        return montantAbonnement
                .add(PRIX_CARTE_TTC)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private Paiement creerPaiement(
            DemandeClient demande,
            BigDecimal montant,
            EnregistrerPaiementRequest requete
    ) {
        String reference = genererReference("PAY");

        if (requete.modePaiement()
                == ModePaiement.ESPECE) {

            return Paiement.creerPaiementEspece(
                    reference,
                    demande,
                    montant
            );
        }

        return Paiement.creerPaiementCheque(
                reference,
                demande,
                montant,
                requete.numeroCheque(),
                requete.banqueCheque(),
                requete.dateEmissionCheque()
        );
    }

    private String genererReference(String prefixe) {
        String suffixe = UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);

        return prefixe
                + "-"
                + Year.now().getValue()
                + "-"
                + suffixe;
    }
}