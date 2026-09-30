package com.rrm.parking.demande.service;

import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.OtpExpireException;
import com.rrm.parking.common.exception.OtpInvalideException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.request.ModificationDemandeReguliereRequest;
import com.rrm.parking.demande.dto.response.DemandeRechercheResponse;
import com.rrm.parking.demande.dto.response.SuiviDemandePublicResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandePerteCarte;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.enums.StatutOtp;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.demande.repository.VerificationOtpRepository;
import com.rrm.parking.document.enums.TypePieceJointe;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;

@Service @RequiredArgsConstructor
public class SuiviDemandePublicService {
    private final DemandeClientRepository demandes;
    private final DemandeRechercheService recherche;
    private final VerificationOtpRepository codes;
    private final OtpEmissionService emission;
    private final OtpCodeService hachage;
    private final ModificationDemandeAgentService modification;

    @Transactional(readOnly = true)
    public SuiviDemandePublicResponse consulter(String reference) {
        DemandeClient demande = trouver(reference);
        if (demande instanceof DemandeNouvelAbonnementRegulier
                || demande instanceof DemandeRenouvellementRegulier
                || demande instanceof DemandePerteCarte) {
            return SuiviDemandePublicResponse.depuis(recherche.obtenirDetail(demande.getId()));
        }
        return SuiviDemandePublicResponse.depuis(DemandeRechercheResponse.depuis(demande),
                demande.getDateCreation());
    }

    @Transactional
    public void demanderCode(String reference) {
        DemandeClient demande = trouver(reference);
        verifierModifiable(demande);
        codes.findFirstByDemandeIdAndStatutOrderByDateCreationDesc(demande.getId(), StatutOtp.EN_ATTENTE)
                .filter(code -> code.getDateCreation().isAfter(LocalDateTime.now().minusMinutes(1)))
                .ifPresent(code -> { throw new ConflitMetierException("Attendez une minute avant de demander un nouveau code"); });
        // Toujours utiliser l'adresse déjà enregistrée, même si le formulaire propose un nouvel e-mail.
        emission.emettre(demande, CanalOtp.EMAIL, demande.getClient().getEmail());
    }

    @Transactional(noRollbackFor = {OtpInvalideException.class, OtpExpireException.class})
    public SuiviDemandePublicResponse enregistrer(String reference, String code,
            ModificationDemandeReguliereRequest requete,
            Map<TypePieceJointe, MultipartFile> documents) {
        DemandeClient demande = trouver(reference);
        verifierModifiable(demande);
        var verification = codes.findFirstByDemandeIdAndStatutOrderByDateCreationDesc(
                        demande.getId(), StatutOtp.EN_ATTENTE)
                .orElseThrow(() -> new OtpInvalideException("Demandez un code de confirmation", 0));
        if (verification.estExpire()) {
            verification.marquerExpire();
            codes.save(verification);
            throw new OtpExpireException("Le code a expiré, demandez-en un autre");
        }
        if (code == null || !hachage.correspond(code, verification.getCodeHash())) {
            verification.enregistrerEchec();
            codes.save(verification);
            throw new OtpInvalideException("Code incorrect", verification.getTentativesRestantes());
        }
        var resultat = modification.modifierParClient(demande.getId(), requete, documents);
        verification.marquerValide();
        codes.save(verification);
        return SuiviDemandePublicResponse.depuis(resultat);
    }

    private DemandeClient trouver(String reference) {
        if (reference == null || reference.isBlank() || reference.length() > 60) {
            throw new RessourceIntrouvableException("Demande introuvable");
        }
        DemandeClient demande = demandes.findByReferenceIgnoreCase(reference.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new RessourceIntrouvableException("Demande introuvable"));
        return (DemandeClient) Hibernate.unproxy(demande);
    }

    private void verifierModifiable(DemandeClient demande) {
        if (demande.getStatut() != StatutDemande.EN_ATTENTE_PAIEMENT
                || !(demande instanceof DemandeNouvelAbonnementRegulier
                || demande instanceof DemandeRenouvellementRegulier)) {
            throw new ConflitMetierException("Cette demande n'est pas modifiable avant paiement");
        }
    }
}
