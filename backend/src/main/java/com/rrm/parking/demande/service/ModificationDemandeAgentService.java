package com.rrm.parking.demande.service;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import com.rrm.parking.audit.entity.AuditLog;
import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.audit.repository.AuditLogRepository;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.request.ModificationDemandeReguliereRequest;
import com.rrm.parking.demande.dto.response.DemandeDetailResponse;
import com.rrm.parking.demande.entity.DemandeClient;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.entity.DemandeRenouvellementRegulier;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.document.entity.PieceJointe;
import com.rrm.parking.document.enums.StatutPieceJointe;
import com.rrm.parking.document.enums.TypePieceJointe;
import com.rrm.parking.document.repository.PieceJointeRepository;
import com.rrm.parking.document.service.FichierStocke;
import com.rrm.parking.document.service.StockageDocumentService;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.utilisateur.repository.UtilisateurRepository;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.vehicule.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModificationDemandeAgentService {

    private final DemandeClientRepository demandeRepository;
    private final ClientParticulierRepository clientRepository;
    private final VehiculeRepository vehiculeRepository;
    private final TarifParkingRepository tarifRepository;
    private final PieceJointeRepository pieceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AuditLogRepository auditRepository;
    private final StockageDocumentService stockageDocumentService;
    private final ObjectMapper objectMapper;

    @Transactional
    public DemandeDetailResponse modifier(
            Long demandeId,
            ModificationDemandeReguliereRequest requete,
            Map<TypePieceJointe, MultipartFile> nouveauxDocuments,
            Long agentId
    ) {
        DemandeClient brute = demandeRepository.findByIdPourMiseAJour(demandeId)
                .orElseThrow(() -> new RessourceIntrouvableException("Demande introuvable"));
        DemandeClient demande = (DemandeClient) Hibernate.unproxy(brute);
        if (demande.getStatut() != StatutDemande.EN_ATTENTE_PAIEMENT) {
            throw new ConflitMetierException(
                    "Seule une demande en attente de paiement peut être modifiée"
            );
        }
        Utilisateur agent = utilisateurRepository.findById(agentId)
                .orElseThrow(() -> new RessourceIntrouvableException("Agent introuvable"));

        Contexte contexte = contexte(demande);
        TarifParking tarif = tarifRepository.findById(requete.tarifParkingId())
                .filter(t -> t.estApplicableA(LocalDate.now()))
                .orElseThrow(() -> new ConflitMetierException(
                        "Le tarif sélectionné n'est plus applicable"
                ));

        verifierUnicite(requete, contexte.client(), contexte.vehicule());
        Map<String, Object> avant = instantane(contexte, demande);

        modifierClient(contexte.client(), requete);
        modifierVehicule(contexte.vehicule(), requete);
        if (demande instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            nouvelle.selectionnerTarif(tarif);
            nouvelle.choisirModePaiement(requete.modePaiement());
        } else if (demande instanceof DemandeRenouvellementRegulier renouvellement) {
            renouvellement.selectionnerTarif(tarif);
            renouvellement.choisirModePaiement(requete.modePaiement());
        } else {
            throw new ConflitMetierException("Ce type de demande n'est pas modifiable par l'agent");
        }

        clientRepository.save(contexte.client());
        vehiculeRepository.save(contexte.vehicule());
        demandeRepository.save(demande);
        remplacerDocuments(contexte.demandeDocuments(), nouveauxDocuments, agent);

        Map<String, Object> apres = instantane(
                new Contexte(contexte.client(), contexte.vehicule(), tarif, contexte.demandeDocuments()),
                demande
        );
        enregistrerAudit(agent, demande, tarif, avant, apres, nouveauxDocuments);

        List<PieceJointe> pieces = pieceRepository
                .findByDemandeIdOrderByDateDepotDesc(contexte.demandeDocuments().getId())
                .stream()
                .filter(piece -> piece.getStatut() != StatutPieceJointe.ARCHIVEE)
                .toList();
        if (demande instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            return DemandeDetailResponse.depuis(nouvelle, pieces);
        }
        return DemandeDetailResponse.depuis(
                (DemandeRenouvellementRegulier) demande,
                contexte.vehicule(),
                pieces
        );
    }

    private Contexte contexte(DemandeClient demande) {
        if (demande instanceof DemandeNouvelAbonnementRegulier nouvelle) {
            return new Contexte(
                    (ClientParticulier) Hibernate.unproxy(nouvelle.getClient()),
                    nouvelle.getVehicule(),
                    nouvelle.getTarifParking(),
                    nouvelle
            );
        }
        if (demande instanceof DemandeRenouvellementRegulier renouvellement) {
            DemandeClient initialeBrute = demandeRepository
                    .findByAbonnementGenereId(renouvellement.getAbonnementConcerne().getId())
                    .orElseThrow(() -> new ConflitMetierException(
                            "La demande initiale de l'abonnement est introuvable"
                    ));
            DemandeClient initialeReelle = (DemandeClient) Hibernate.unproxy(initialeBrute);
            if (!(initialeReelle instanceof DemandeNouvelAbonnementRegulier initiale)) {
                throw new ConflitMetierException("La demande initiale est invalide");
            }
            return new Contexte(
                    (ClientParticulier) Hibernate.unproxy(renouvellement.getClient()),
                    initiale.getVehicule(),
                    renouvellement.getTarifParking(),
                    initiale
            );
        }
        throw new ConflitMetierException("Ce type de demande n'est pas modifiable par l'agent");
    }

    private void verifierUnicite(
            ModificationDemandeReguliereRequest requete,
            ClientParticulier client,
            Vehicule vehicule
    ) {
        clientRepository.findByCinIgnoreCase(requete.cin().trim())
                .filter(existant -> !existant.getId().equals(client.getId()))
                .ifPresent(existant -> { throw new ConflitMetierException("Cette CIN appartient déjà à un autre client"); });
        vehiculeRepository.findByImmatriculationIgnoreCase(normaliserImmatriculation(requete.immatriculation()))
                .filter(existant -> !existant.getId().equals(vehicule.getId()))
                .ifPresent(existant -> { throw new ConflitMetierException("Cette immatriculation appartient déjà à un autre véhicule"); });
    }

    private void modifierClient(ClientParticulier client, ModificationDemandeReguliereRequest r) {
        client.setNom(r.nom().trim());
        client.setPrenom(r.prenom().trim());
        client.setCin(r.cin().trim().toUpperCase(Locale.ROOT));
        client.setEmail(r.email().trim().toLowerCase(Locale.ROOT));
        client.setTelephone(r.telephone().trim());
    }

    private void modifierVehicule(Vehicule vehicule, ModificationDemandeReguliereRequest r) {
        vehicule.setImmatriculation(normaliserImmatriculation(r.immatriculation()));
        vehicule.setMarque(nettoyer(r.marque()));
        vehicule.setModele(nettoyer(r.modele()));
        vehicule.setCouleur(nettoyer(r.couleur()));
        vehicule.setType(r.typeVehicule());
    }

    private void remplacerDocuments(
            DemandeClient cible,
            Map<TypePieceJointe, MultipartFile> documents,
            Utilisateur agent
    ) {
        if (documents == null || documents.isEmpty()) return;
        List<PieceJointe> existantes = pieceRepository
                .findByDemandeIdOrderByDateDepotDesc(cible.getId());
        documents.forEach((type, fichier) -> {
            if (fichier == null || fichier.isEmpty()) return;
            existantes.stream()
                    .filter(piece -> piece.getTypePiece() == type)
                    .filter(piece -> piece.getStatut() != StatutPieceJointe.ARCHIVEE)
                    .forEach(PieceJointe::archiver);
            FichierStocke stocke = stockageDocumentService.stocker(
                    fichier,
                    "demandes/" + cible.getReference() + "/corrections/" + type.name()
            );
            pieceRepository.save(PieceJointe.pourDemande(
                    "PJ-" + UUID.randomUUID().toString().replace("-", "")
                            .substring(0, 20).toUpperCase(Locale.ROOT),
                    type,
                    stocke.nomFichierOriginal(),
                    stocke.storageKey(),
                    stocke.typeMime(),
                    stocke.tailleOctets(),
                    stocke.checksumSha256(),
                    cible,
                    agent
            ));
        });
    }

    private void enregistrerAudit(
            Utilisateur agent,
            DemandeClient demande,
            TarifParking tarif,
            Map<String, Object> avant,
            Map<String, Object> apres,
            Map<TypePieceJointe, MultipartFile> documents
    ) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("avant", avant);
        details.put("apres", apres);
        details.put("documentsRemplaces", documents == null ? List.of() : documents.keySet());
        auditRepository.save(new AuditLog(
                agent,
                agent.getEmail(),
                tarif.getParking(),
                TypeActionAudit.MODIFICATION,
                ResultatAudit.SUCCES,
                "DEMANDE_CLIENT",
                demande.getId(),
                demande.getReference(),
                "Demande modifiée avant paiement",
                json(details),
                null, null, "PUT",
                "/api/agent/demandes/" + demande.getId(),
                null
        ));
    }

    private Map<String, Object> instantane(Contexte c, DemandeClient demande) {
        Map<String, Object> valeurs = new LinkedHashMap<>();
        valeurs.put("nom", c.client().getNom());
        valeurs.put("prenom", c.client().getPrenom());
        valeurs.put("cin", c.client().getCin());
        valeurs.put("email", c.client().getEmail());
        valeurs.put("telephone", c.client().getTelephone());
        valeurs.put("immatriculation", c.vehicule().getImmatriculation());
        valeurs.put("marque", c.vehicule().getMarque());
        valeurs.put("modele", c.vehicule().getModele());
        valeurs.put("couleur", c.vehicule().getCouleur());
        valeurs.put("typeVehicule", c.vehicule().getType());
        valeurs.put("tarifParkingId", c.tarif().getId());
        valeurs.put("parking", c.tarif().getParking().getNom());
        valeurs.put("forfait", c.tarif().getForfait().getLibelle());
        valeurs.put("dureeMois", c.tarif().getDureeEnMois());
        valeurs.put("modePaiement", demande instanceof DemandeNouvelAbonnementRegulier n
                ? n.getModePaiementSouhaite()
                : ((DemandeRenouvellementRegulier) demande).getModePaiementSouhaite());
        return valeurs;
    }

    private String json(Object valeur) {
        try {
            return objectMapper.writeValueAsString(valeur);
        } catch (JacksonException exception) {
            throw new IllegalStateException("Impossible de produire l'historique", exception);
        }
    }

    private String normaliserImmatriculation(String valeur) {
        return valeur.trim().toUpperCase(Locale.ROOT);
    }

    private String nettoyer(String valeur) {
        return valeur == null || valeur.isBlank() ? null : valeur.trim();
    }

    private record Contexte(
            ClientParticulier client,
            Vehicule vehicule,
            TarifParking tarif,
            DemandeClient demandeDocuments
    ) {
    }
}
