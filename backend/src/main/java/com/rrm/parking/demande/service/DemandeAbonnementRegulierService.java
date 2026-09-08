package com.rrm.parking.demande.service;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientParticulier;
import com.rrm.parking.client.repository.ClientParticulierRepository;
import com.rrm.parking.common.exception.ConflitMetierException;
import com.rrm.parking.common.exception.RessourceIntrouvableException;
import com.rrm.parking.demande.dto.request.DemandeAbonnementRegulierRequest;
import com.rrm.parking.demande.dto.response.DemandeAbonnementRegulierResponse;
import com.rrm.parking.demande.entity.DemandeNouvelAbonnementRegulier;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.repository.DemandeClientRepository;
import com.rrm.parking.document.service.FichierStocke;
import com.rrm.parking.document.service.StockageDocumentService;
import com.rrm.parking.demande.service.otp.OtpGenere;
import com.rrm.parking.document.entity.PieceJointe;
import com.rrm.parking.document.enums.TypePieceJointe;
import com.rrm.parking.document.repository.PieceJointeRepository;
import com.rrm.parking.document.service.FichierStocke;
import com.rrm.parking.document.service.StockageDocumentService;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.repository.TarifParkingRepository;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.vehicule.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemandeAbonnementRegulierService {

    private final ClientParticulierRepository
            clientParticulierRepository;

    private final VehiculeRepository vehiculeRepository;

    private final TarifParkingRepository
            tarifParkingRepository;

    private final DemandeClientRepository
            demandeClientRepository;

    private final PieceJointeRepository
            pieceJointeRepository;

    private final StockageDocumentService
            stockageDocumentService;

    private final OtpEmissionService
            otpEmissionService;

    @Transactional
    public DemandeAbonnementRegulierResponse creer(
            DemandeAbonnementRegulierRequest requete,
            MultipartFile cinRecto,
            MultipartFile cinVerso,
            MultipartFile carteGriseRecto,
            MultipartFile carteGriseVerso
    ) {
        verifierConditions(requete);

        List<String> fichiersCrees =
                new ArrayList<>();

        try {
            TarifParking tarif =
                    obtenirTarifApplicable(
                            requete.tarifParkingId()
                    );

            ClientParticulier client =
                    obtenirOuCreerClient(requete);

            Vehicule vehicule =
                    obtenirOuCreerVehicule(
                            requete,
                            client
                    );

            DemandeNouvelAbonnementRegulier demande =
                    creerDemande(
                            requete,
                            client,
                            vehicule,
                            tarif
                    );

            enregistrerDocuments(
                    demande,
                    cinRecto,
                    cinVerso,
                    carteGriseRecto,
                    carteGriseVerso,
                    fichiersCrees
            );

            OtpGenere otp = otpEmissionService.emettre(
                    demande,
                    requete.canalOtp(),
                    client.getTelephone()
            );

            return new DemandeAbonnementRegulierResponse(
                    demande.getReference(),
                    demande.getStatut(),
                    demande.getDateSoumission(),
                    otp.dateExpiration(),
                    otp.tentativesRestantes(),
                    otp.canal(),
                    otp.destinationMasquee()
            );
        } catch (RuntimeException exception) {
            supprimerFichiersCrees(fichiersCrees);
            throw exception;
        }
    }

    private ClientParticulier obtenirOuCreerClient(
            DemandeAbonnementRegulierRequest requete
    ) {
        String cin = requete.cin()
                .trim()
                .toUpperCase(Locale.ROOT);

        ClientParticulier client =
                clientParticulierRepository
                        .findByCinIgnoreCase(cin)
                        .orElseGet(() ->
                                new ClientParticulier(
                                        requete.nom().trim(),
                                        requete.prenom().trim(),
                                        cin
                                )
                        );

        client.setNom(requete.nom().trim());
        client.setPrenom(requete.prenom().trim());
        client.setCin(cin);
        client.setEmail(
                requete.email()
                        .trim()
                        .toLowerCase(Locale.ROOT)
        );
        client.setTelephone(
                normaliserTelephone(
                        requete.telephone()
                )
        );

        return clientParticulierRepository.save(
                client
        );
    }

    private Vehicule obtenirOuCreerVehicule(
            DemandeAbonnementRegulierRequest requete,
            ClientParticulier client
    ) {
        String immatriculation =
                construireImmatriculation(requete);

        Vehicule vehicule = vehiculeRepository
                .findByImmatriculationIgnoreCase(
                        immatriculation
                )
                .map(existant -> {
                    verifierProprietaire(
                            existant,
                            client
                    );

                    return existant;
                })
                .orElseGet(() ->
                        new Vehicule(
                                immatriculation,
                                requete.typeVehicule(),
                                client
                        )
                );

        vehicule.setImmatriculation(
                immatriculation
        );
        vehicule.setType(
                requete.typeVehicule()
        );
        vehicule.setMarque(
                nettoyerTexteOptionnel(
                        requete.marque()
                )
        );
        vehicule.setModele(
                nettoyerTexteOptionnel(
                        requete.modele()
                )
        );
        vehicule.setCouleur(
                nettoyerTexteOptionnel(
                        requete.couleur()
                )
        );
        vehicule.setClient(client);

        return vehiculeRepository.save(
                vehicule
        );
    }

    private void verifierProprietaire(
            Vehicule vehicule,
            ClientParticulier client
    ) {
        Client proprietaire =
                vehicule.getClient();

        boolean memeClient =
                proprietaire == client
                        || (
                        proprietaire != null
                                && proprietaire.getId() != null
                                && client.getId() != null
                                && proprietaire.getId()
                                .equals(client.getId())
                );

        if (!memeClient) {
            throw new ConflitMetierException(
                    "Cette immatriculation est déjà déclarée par un autre client"
            );
        }
    }

    private TarifParking obtenirTarifApplicable(
            Long tarifId
    ) {
        TarifParking tarif =
                tarifParkingRepository
                        .findById(tarifId)
                        .orElseThrow(() ->
                                new RessourceIntrouvableException(
                                        "Tarif parking introuvable"
                                )
                        );

        if (!tarif.estApplicableA(
                LocalDate.now()
        )) {
            throw new ConflitMetierException(
                    "Le tarif sélectionné n'est plus applicable"
            );
        }

        return tarif;
    }

    private DemandeNouvelAbonnementRegulier
    creerDemande(
            DemandeAbonnementRegulierRequest requete,
            ClientParticulier client,
            Vehicule vehicule,
            TarifParking tarif
    ) {
        DemandeNouvelAbonnementRegulier demande =
                new DemandeNouvelAbonnementRegulier(
                        genererReferenceDemande(),
                        CanalInitiation.EN_LIGNE,
                        client,
                        null
                );

        demande.selectionnerTarif(tarif);
        demande.selectionnerVehicule(vehicule);
        demande.choisirModePaiement(
                requete.modePaiement()
        );
        demande.soumettre();

        return demandeClientRepository
                .saveAndFlush(demande);
    }

    private void enregistrerDocuments(
            DemandeNouvelAbonnementRegulier demande,
            MultipartFile cinRecto,
            MultipartFile cinVerso,
            MultipartFile carteGriseRecto,
            MultipartFile carteGriseVerso,
            List<String> fichiersCrees
    ) {
        String dossier =
                "demandes/" + demande.getReference();

        List<PieceJointe> pieces = List.of(
                creerPieceJointe(
                        demande,
                        cinRecto,
                        TypePieceJointe.CIN_RECTO,
                        dossier,
                        fichiersCrees
                ),
                creerPieceJointe(
                        demande,
                        cinVerso,
                        TypePieceJointe.CIN_VERSO,
                        dossier,
                        fichiersCrees
                ),
                creerPieceJointe(
                        demande,
                        carteGriseRecto,
                        TypePieceJointe.CARTE_GRISE_RECTO,
                        dossier,
                        fichiersCrees
                ),
                creerPieceJointe(
                        demande,
                        carteGriseVerso,
                        TypePieceJointe.CARTE_GRISE_VERSO,
                        dossier,
                        fichiersCrees
                )
        );

        pieceJointeRepository.saveAll(pieces);
    }

    private PieceJointe creerPieceJointe(
            DemandeNouvelAbonnementRegulier demande,
            MultipartFile fichier,
            TypePieceJointe type,
            String dossier,
            List<String> fichiersCrees
    ) {
        FichierStocke fichierStocke =
                stockageDocumentService.stocker(
                        fichier,
                        dossier
                );

        fichiersCrees.add(
                fichierStocke.storageKey()
        );

        return PieceJointe.pourDemande(
                genererReferencePieceJointe(),
                type,
                fichierStocke.nomFichierOriginal(),
                fichierStocke.storageKey(),
                fichierStocke.typeMime(),
                fichierStocke.tailleOctets(),
                fichierStocke.checksumSha256(),
                demande,
                null
        );
    }

    private String construireImmatriculation(
            DemandeAbonnementRegulierRequest requete
    ) {
        return requete.numeroImmatriculation()
                .trim()
                + "|"
                + requete.serieImmatriculation()
                .trim()
                .toUpperCase(Locale.ROOT)
                + "|"
                + requete.codeRegion().trim();
    }

    private String normaliserTelephone(
            String telephone
    ) {
        String valeur = telephone
                .trim()
                .replaceAll("[\\s.()-]", "");

        if (valeur.startsWith("0")) {
            return "+212" + valeur.substring(1);
        }

        return valeur;
    }

    private String nettoyerTexteOptionnel(
            String valeur
    ) {
        if (valeur == null
                || valeur.isBlank()) {
            return null;
        }

        return valeur.trim();
    }

    private String genererReferenceDemande() {
        String date = LocalDate.now().format(
                DateTimeFormatter.BASIC_ISO_DATE
        );

        String reference;

        do {
            reference = "DEM-"
                    + date
                    + "-"
                    + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);
        } while (
                demandeClientRepository
                        .existsByReference(reference)
        );

        return reference;
    }

    private String genererReferencePieceJointe() {
        return "PJ-"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 20)
                .toUpperCase(Locale.ROOT);
    }

    private void verifierConditions(
            DemandeAbonnementRegulierRequest requete
    ) {
        if (requete == null) {
            throw new IllegalArgumentException(
                    "Les informations de la demande sont obligatoires"
            );
        }

        if (!requete.conditionsAcceptees()) {
            throw new IllegalArgumentException(
                    "Les conditions générales doivent être acceptées"
            );
        }
    }

    private void supprimerFichiersCrees(
            List<String> storageKeys
    ) {
        for (String storageKey : storageKeys) {
            try {
                stockageDocumentService
                        .supprimerSiExiste(storageKey);
            } catch (RuntimeException exception) {
                log.error(
                        "Impossible de nettoyer le fichier {}",
                        storageKey,
                        exception
                );
            }
        }
    }
}