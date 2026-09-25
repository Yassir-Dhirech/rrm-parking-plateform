package com.rrm.parking.demande.entity;

import com.rrm.parking.contrat.entity.ContratCorporate;
import com.rrm.parking.abonnement.entity.AbonnementEntreprise;
import com.rrm.parking.client.entity.Client;
import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.tarification.entity.TarifParking;
import com.rrm.parking.tarification.model.DecompteCorporate;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import com.rrm.parking.vehicule.entity.Vehicule;
import com.rrm.parking.facturation.entity.Facture;
import com.rrm.parking.paiement.entity.Paiement;
import com.rrm.parking.paiement.enums.StatutPaiement;
import jakarta.persistence.*;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "demande_nouveau_contrat_corporate")
@PrimaryKeyJoinColumn(
        name = "id",
        foreignKey = @ForeignKey(
                name = "fk_demande_corporate_demande"
        )
)
public class DemandeNouveauContratCorporate extends DemandeClient {

    /*
     * Association historique conservée nullable pour permettre la migration
     * des anciennes bases. La tarification corporate est désormais calculée
     * selon le nombre de places, sans TarifParking régulier.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "tarif_parking_id",
            foreignKey = @ForeignKey(
                    name = "fk_demande_corporate_tarif"
            )
    )
    private TarifParking tarifParking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "parking_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_demande_corporate_parking")
    )
    private Parking parking;

    @Column(nullable = false, length = 80)
    private String titreFoncier;

    @Column(nullable = false, length = 200)
    private String libelleProjet;

    @Column(nullable = false, length = 500)
    private String adresseProjet;

    @Column(length = 10)
    private String cinRepresentant;

    @Column(length = 200)
    private String plageHoraire;

    @Column(nullable = false)
    private Integer nombrePlaces;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prixMensuelUnitaireTtc;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montantAbonnementTtc;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal fraisCartesTtc;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montantTotalTtc;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "demande_corporate_immatriculation",
            joinColumns = @JoinColumn(name = "demande_id")
    )
    @Column(name = "immatriculation", nullable = false, length = 30)
    private Set<String> immatriculationsDeclarees = new LinkedHashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "demande_corporate_vehicule",
            joinColumns = @JoinColumn(
                    name = "demande_id",
                    foreignKey = @ForeignKey(
                            name = "fk_demande_corporate_vehicule_demande"
                    )
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "vehicule_id",
                    foreignKey = @ForeignKey(
                            name = "fk_demande_corporate_vehicule_vehicule"
                    )
            ),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_demande_corporate_vehicule",
                    columnNames = {"demande_id", "vehicule_id"}
            )
    )
    private Set<Vehicule> vehiculesSelectionnes = new LinkedHashSet<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "contrat_genere_id",
            unique = true,
            foreignKey = @ForeignKey(
                    name = "fk_demande_corporate_contrat"
            )
    )
    private ContratCorporate contratGenere;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "paiement_corporate_id",
            unique = true,
            foreignKey = @ForeignKey(name = "fk_demande_corporate_paiement")
    )
    private Paiement paiementCorporate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "facture_generee_id",
            unique = true,
            foreignKey = @ForeignKey(name = "fk_demande_corporate_facture")
    )
    private Facture factureGeneree;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "abonnement_genere_id",
            unique = true,
            foreignKey = @ForeignKey(name = "fk_demande_corporate_abonnement")
    )
    private AbonnementEntreprise abonnementGenere;

    private LocalDateTime dateConvocation;

    private LocalDateTime datePaiementEtRemiseContrat;

    private LocalDateTime dateRetourContratLegalise;

    private LocalDateTime dateFacturation;

    private LocalDateTime dateActivationCartes;

    private LocalDateTime dateFinalisation;

    protected DemandeNouveauContratCorporate() {
        // Constructeur JPA
    }

    public DemandeNouveauContratCorporate(
            String reference,
            CanalInitiation canalInitiation,
            ClientEntreprise client,
            Utilisateur initieePar,
            Parking parking,
            String titreFoncier,
            String libelleProjet,
            String adresseProjet,
            String cinRepresentant,
            String plageHoraire,
            DecompteCorporate decompte
    ) {
        super(reference, canalInitiation, client, initieePar);

        this.parking = exigerNonNull(parking, "Le parking est obligatoire");
        this.titreFoncier = exigerTexte(titreFoncier, "Le titre foncier est obligatoire");
        this.libelleProjet = exigerTexte(libelleProjet, "Le libellé du projet est obligatoire");
        this.adresseProjet = exigerTexte(adresseProjet, "L'adresse du projet est obligatoire");
        this.cinRepresentant = exigerTexte(
                cinRepresentant,
                "Le CIN du représentant est obligatoire"
        ).toUpperCase(java.util.Locale.ROOT);
        this.plageHoraire = exigerTexte(
                plageHoraire,
                "La plage horaire est obligatoire"
        );

        DecompteCorporate calcul = exigerNonNull(
                decompte,
                "Le décompte corporate est obligatoire"
        );
        this.nombrePlaces = calcul.nombrePlaces();
        this.prixMensuelUnitaireTtc = calcul.prixMensuelUnitaireTtc();
        this.montantAbonnementTtc = calcul.montantAbonnementTtc();
        this.fraisCartesTtc = calcul.fraisCartesTtc();
        this.montantTotalTtc = calcul.montantTotalTtc();
    }

    public void ajouterImmatriculation(String immatriculation) {
        verifierModifiableAvantPaiement();
        String valeur = exigerTexte(
                immatriculation,
                "L'immatriculation ne peut pas être vide"
        );
        if (immatriculationsDeclarees.size() >= nombrePlaces) {
            throw new IllegalStateException(
                    "Le nombre d'immatriculations dépasse le nombre de places"
            );
        }
        immatriculationsDeclarees.add(valeur);
    }

    public void selectionnerTarif(TarifParking tarif) {
        verifierModifiableAvantPaiement();

        this.tarifParking = exigerNonNull(
                tarif,
                "Le tarif corporate est obligatoire"
        );
    }

    public void ajouterVehicule(Vehicule vehicule) {
        verifierModifiableAvantPaiement();

        Vehicule vehiculeValide = exigerNonNull(
                vehicule,
                "Le véhicule est obligatoire"
        );

        verifierVehiculeEntreprise(vehiculeValide);
        vehiculesSelectionnes.add(vehiculeValide);
    }

    public void retirerVehicule(Vehicule vehicule) {
        verifierModifiableAvantPaiement();

        if (vehicule == null) {
            return;
        }

        vehiculesSelectionnes.remove(vehicule);
    }

    public void associerContratGenere(ContratCorporate contrat) {
        if (getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException(
                    "La demande doit être validée avant de générer le contrat"
            );
        }

        if (contratGenere != null) {
            throw new IllegalStateException(
                    "Un contrat a déjà été généré pour cette demande"
            );
        }

        this.contratGenere = exigerNonNull(
                contrat,
                "Le contrat généré est obligatoire"
        );
    }

    public void convoquerClient(Utilisateur responsable) {
        if (getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException(
                    "La demande doit être validée avant la convocation"
            );
        }
        if (contratGenere == null) {
            throw new IllegalStateException(
                    "Le contrat doit être généré avant la convocation"
            );
        }
        if (dateConvocation != null) {
            throw new IllegalStateException(
                    "Le client a déjà été convoqué"
            );
        }

        dateConvocation = LocalDateTime.now();
        changerStatut(
                StatutDemande.EN_ATTENTE_PAIEMENT_SIGNATURE,
                com.rrm.parking.demande.enums.OrigineTransition
                        .UTILISATEUR_INTERNE,
                exigerNonNull(
                        responsable,
                        "Le responsable est obligatoire"
                ),
                "Convocation au siège pour paiement et signature"
        );
    }

    public void enregistrerPaiementEtRemiseContrat(
            Paiement paiement,
            Utilisateur responsable
    ) {
        verifierStatut(StatutDemande.EN_ATTENTE_PAIEMENT_SIGNATURE);
        if (contratGenere == null) {
            throw new IllegalStateException("Le contrat corporate est introuvable");
        }
        if (paiementCorporate != null) {
            throw new IllegalStateException("Le paiement corporate est déjà enregistré");
        }
        Paiement paiementValide = exigerNonNull(
                paiement,
                "Le paiement corporate est obligatoire"
        );
        if (paiementValide.getStatut() != StatutPaiement.CONFIRME) {
            throw new IllegalArgumentException("Le paiement corporate doit être confirmé");
        }

        contratGenere.remettreAuClient();
        paiementCorporate = paiementValide;
        datePaiementEtRemiseContrat = LocalDateTime.now();
        changerStatut(
                StatutDemande.EN_ATTENTE_RETOUR_CONTRAT_LEGALISE,
                com.rrm.parking.demande.enums.OrigineTransition.UTILISATEUR_INTERNE,
                exigerNonNull(responsable, "Le responsable est obligatoire"),
                "Paiement par chèque confirmé et contrat remis au client"
        );
    }

    public void declarerRetourContratLegalise(Utilisateur responsable) {
        verifierStatut(StatutDemande.EN_ATTENTE_RETOUR_CONTRAT_LEGALISE);
        if (contratGenere == null) {
            throw new IllegalStateException("Le contrat corporate est introuvable");
        }

        contratGenere.enregistrerRetourSigneLegalise();
        dateRetourContratLegalise = LocalDateTime.now();
        changerStatut(
                StatutDemande.EN_ATTENTE_FACTURATION,
                com.rrm.parking.demande.enums.OrigineTransition.UTILISATEUR_INTERNE,
                exigerNonNull(responsable, "Le responsable est obligatoire"),
                "Retour du contrat signé et légalisé déclaré"
        );
    }

    public void enregistrerFacturation(
            Facture facture,
            AbonnementEntreprise abonnement,
            Utilisateur responsable
    ) {
        verifierStatut(StatutDemande.EN_ATTENTE_FACTURATION);
        if (factureGeneree != null || abonnementGenere != null) {
            throw new IllegalStateException("Le dossier corporate est déjà facturé");
        }

        factureGeneree = exigerNonNull(facture, "La facture est obligatoire");
        abonnementGenere = exigerNonNull(
                abonnement,
                "L'abonnement corporate est obligatoire"
        );
        dateFacturation = LocalDateTime.now();
        changerStatut(
                StatutDemande.EN_PREPARATION_CARTES,
                com.rrm.parking.demande.enums.OrigineTransition.UTILISATEUR_INTERNE,
                exigerNonNull(responsable, "Le responsable est obligatoire"),
                "Facture émise et demandes d'impression des cartes créées"
        );
    }

    public void marquerCartesActivees(
            LocalDateTime dateDerniereActivation,
            Utilisateur superviseur
    ) {
        verifierStatut(StatutDemande.EN_PREPARATION_CARTES);
        dateActivationCartes = exigerNonNull(
                dateDerniereActivation,
                "La date d'activation des cartes est obligatoire"
        );
        changerStatut(
                StatutDemande.PRETE_A_FINALISER,
                com.rrm.parking.demande.enums.OrigineTransition.UTILISATEUR_INTERNE,
                exigerNonNull(superviseur, "Le superviseur est obligatoire"),
                "Toutes les cartes sont activées et testées"
        );
    }

    public void finaliser(Utilisateur responsable) {
        verifierStatut(StatutDemande.PRETE_A_FINALISER);
        if (dateActivationCartes == null || factureGeneree == null) {
            throw new IllegalStateException(
                    "La facture et l'activation de toutes les cartes sont obligatoires"
            );
        }
        dateFinalisation = LocalDateTime.now();
        changerStatut(
                StatutDemande.FINALISEE,
                com.rrm.parking.demande.enums.OrigineTransition.UTILISATEUR_INTERNE,
                exigerNonNull(responsable, "Le responsable est obligatoire"),
                "Dossier corporate finalisé et client informé"
        );
    }

    private void verifierStatut(StatutDemande attendu) {
        if (getStatut() != attendu) {
            throw new IllegalStateException(
                    "Opération corporate impossible depuis le statut " + getStatut()
            );
        }
    }

    @PrePersist
    private void verifierAvantCreation() {
        if (parking == null || nombrePlaces == null || nombrePlaces <= 0) {
            throw new IllegalStateException(
                    "Le parking et le nombre de places corporate sont obligatoires"
            );
        }
        if (cinRepresentant == null || plageHoraire == null) {
            throw new IllegalStateException(
                    "Le CIN du représentant et la plage horaire sont obligatoires"
            );
        }
    }

    private void verifierVehiculeEntreprise(Vehicule vehicule) {
        Client clientDemande = getClient();
        Client proprietaireVehicule = vehicule.getClient();

        boolean memeClient = clientDemande == proprietaireVehicule
                || (
                clientDemande != null
                        && proprietaireVehicule != null
                        && clientDemande.getId() != null
                        && clientDemande.getId()
                        .equals(proprietaireVehicule.getId())
        );

        if (!memeClient) {
            throw new IllegalArgumentException(
                    "Le véhicule n'appartient pas à l'entreprise de la demande"
            );
        }
    }

    private void verifierDemandeNonSoumise() {
        if (getStatut() != null) {
            throw new IllegalStateException(
                    "La demande ne peut plus être modifiée après sa soumission"
            );
        }
    }

    private <T> T exigerNonNull(T valeur, String message) {
        if (valeur == null) {
            throw new IllegalArgumentException(message);
        }

        return valeur;
    }

    private String exigerTexte(String valeur, String message) {
        if (valeur == null || valeur.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return valeur.trim();
    }

    public TarifParking getTarifParking() {
        return tarifParking;
    }

    public Parking getParking() {
        return parking;
    }

    public String getTitreFoncier() {
        return titreFoncier;
    }

    public String getLibelleProjet() {
        return libelleProjet;
    }

    public String getAdresseProjet() {
        return adresseProjet;
    }

    public String getCinRepresentant() {
        return cinRepresentant;
    }

    public String getPlageHoraire() {
        return plageHoraire;
    }

    public Integer getNombrePlaces() {
        return nombrePlaces;
    }

    public BigDecimal getPrixMensuelUnitaireTtc() {
        return prixMensuelUnitaireTtc;
    }

    public BigDecimal getMontantAbonnementTtc() {
        return montantAbonnementTtc;
    }

    public BigDecimal getFraisCartesTtc() {
        return fraisCartesTtc;
    }

    public BigDecimal getMontantTotalTtc() {
        return montantTotalTtc;
    }

    public Set<String> getImmatriculationsDeclarees() {
        return Collections.unmodifiableSet(immatriculationsDeclarees);
    }

    public Set<Vehicule> getVehiculesSelectionnes() {
        return Collections.unmodifiableSet(vehiculesSelectionnes);
    }

    public ContratCorporate getContratGenere() {
        return contratGenere;
    }

    public LocalDateTime getDateConvocation() {
        return dateConvocation;
    }

    public Paiement getPaiementCorporate() { return paiementCorporate; }
    public Facture getFactureGeneree() { return factureGeneree; }
    public AbonnementEntreprise getAbonnementGenere() { return abonnementGenere; }
    public LocalDateTime getDatePaiementEtRemiseContrat() { return datePaiementEtRemiseContrat; }
    public LocalDateTime getDateRetourContratLegalise() { return dateRetourContratLegalise; }
    public LocalDateTime getDateFacturation() { return dateFacturation; }
    public LocalDateTime getDateActivationCartes() { return dateActivationCartes; }
    public LocalDateTime getDateFinalisation() { return dateFinalisation; }
}
