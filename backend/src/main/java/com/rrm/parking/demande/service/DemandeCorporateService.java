package com.rrm.parking.demande.service;

import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.client.repository.ClientEntrepriseRepository;
import com.rrm.parking.demande.dto.request.DemandeCorporateRequest;
import com.rrm.parking.demande.dto.response.DemandeCorporateResponse;
import com.rrm.parking.demande.entity.DemandeNouveauContratCorporate;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.repository.DemandeNouveauContratCorporateRepository;
import com.rrm.parking.demande.service.otp.OtpGenere;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.model.DecompteCorporate;
import com.rrm.parking.tarification.service.TarificationCorporateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemandeCorporateService {

    private final ClientEntrepriseRepository clientEntrepriseRepository;
    private final DemandeNouveauContratCorporateRepository demandeRepository;
    private final TarificationCorporateService tarificationCorporateService;
    private final CapaciteCorporateService capaciteCorporateService;
    private final OtpEmissionService otpEmissionService;

    @Transactional
    public DemandeCorporateResponse creer(DemandeCorporateRequest requete) {
        int nombrePlaces = requete.nombrePlaces();
        Parking parking = capaciteCorporateService.verrouillerEtVerifier(
                requete.parkingId(),
                nombrePlaces
        );
        DecompteCorporate decompte =
                tarificationCorporateService.calculerDecompte(nombrePlaces);
        ClientEntreprise entreprise = obtenirOuCreerEntreprise(requete);

        DemandeNouveauContratCorporate demande =
                new DemandeNouveauContratCorporate(
                        genererReference(),
                        CanalInitiation.EN_LIGNE,
                        entreprise,
                        null,
                        parking,
                        requete.titreFoncier(),
                        requete.libelleProjet(),
                        requete.adresseProjet(),
                        requete.cinRepresentant(),
                        requete.plageHoraire(),
                        decompte
                );

        normaliserImmatriculations(requete, nombrePlaces)
                .forEach(demande::ajouterImmatriculation);
        demande.soumettre();
        demandeRepository.saveAndFlush(demande);

        OtpGenere otp = otpEmissionService.emettre(
                demande,
                CanalOtp.EMAIL,
                entreprise.getEmail()
        );

        return new DemandeCorporateResponse(
                demande.getReference(),
                demande.getStatut(),
                demande.getDateSoumission(),
                otp.dateExpiration(),
                otp.tentativesRestantes(),
                otp.canal(),
                otp.destinationMasquee(),
                demande.getCinRepresentant(),
                demande.getPlageHoraire(),
                decompte.nombrePlaces(),
                decompte.dureeEnMois(),
                decompte.prixMensuelUnitaireTtc(),
                decompte.montantAbonnementTtc(),
                decompte.fraisCartesTtc(),
                decompte.montantTotalTtc()
        );
    }

    private ClientEntreprise obtenirOuCreerEntreprise(
            DemandeCorporateRequest requete
    ) {
        String ice = requete.ice().trim();
        ClientEntreprise entreprise = clientEntrepriseRepository
                .findByIce(ice)
                .orElseGet(() -> new ClientEntreprise(
                        requete.raisonSociale().trim(),
                        ice,
                        requete.adresseProjet().trim()
                ));

        entreprise.setRaisonSociale(requete.raisonSociale().trim());
        entreprise.setIce(ice);
        entreprise.setNumeroRC(requete.numeroRc().trim());
        entreprise.setAdresseSiege(requete.adresseProjet().trim());
        entreprise.setNomContactPrincipal(requete.nomRepresentant().trim());
        entreprise.setPrenomContactPrincipal(requete.prenomRepresentant().trim());
        entreprise.setTelephone(normaliserTelephone(requete.telephoneRepresentant()));
        entreprise.setEmail(
                requete.emailRepresentant().trim().toLowerCase(Locale.ROOT)
        );

        return clientEntrepriseRepository.save(entreprise);
    }

    private Set<String> normaliserImmatriculations(
            DemandeCorporateRequest requete,
            int nombrePlaces
    ) {
        Set<String> valeurs = new LinkedHashSet<>();
        if (requete.immatriculations() != null) {
            requete.immatriculations().stream()
                    .filter(valeur -> valeur != null && !valeur.isBlank())
                    .map(valeur -> valeur.trim().toUpperCase(Locale.ROOT))
                    .forEach(valeurs::add);
        }
        if (valeurs.size() > nombrePlaces) {
            throw new IllegalArgumentException(
                    "Le nombre d'immatriculations dépasse le nombre de places"
            );
        }
        return valeurs;
    }

    private String normaliserTelephone(String telephone) {
        String valeur = telephone.replaceAll("[\\s().-]", "");
        if (valeur.matches("^[67][0-9]{8}$")) {
            return "0" + valeur;
        }
        return valeur;
    }

    private String genererReference() {
        return "DEM-CORP-"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-"
                + UUID.randomUUID().toString()
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);
    }
}
