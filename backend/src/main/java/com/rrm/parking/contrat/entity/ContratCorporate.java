package com.rrm.parking.contrat.entity;

import com.rrm.parking.client.entity.ClientEntreprise;
import com.rrm.parking.contrat.enums.StatutContrat;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "contrat_corporate",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_contrat_corporate_reference",
                        columnNames = "reference"
                )
        }
)
public class ContratCorporate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private StatutContrat statut;

    @Column(nullable = false)
    private Integer nombrePlacesContractuelles;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_entreprise_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_contrat_corporate_client"
            )
    )
    private ClientEntreprise clientEntreprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "signe_par_utilisateur_id",
            foreignKey = @ForeignKey(
                    name = "fk_contrat_corporate_signataire"
            )
    )
    private Utilisateur signePar;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(nullable = false)
    private LocalDateTime dateModification;

    private LocalDateTime dateRemiseAuClient;

    private LocalDateTime dateRetourSigneLegalise;

    private LocalDateTime dateSignatureDG;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    protected ContratCorporate() {
    }

    public ContratCorporate(
            String reference,
            Integer nombrePlacesContractuelles,
            ClientEntreprise clientEntreprise
    ) {
        if (reference == null || reference.isBlank()) {
            throw new IllegalArgumentException(
                    "La référence du contrat est obligatoire"
            );
        }

        if (nombrePlacesContractuelles == null
                || nombrePlacesContractuelles <= 0) {
            throw new IllegalArgumentException(
                    "Le nombre de places doit être positif"
            );
        }

        if (clientEntreprise == null) {
            throw new IllegalArgumentException(
                    "Le client entreprise est obligatoire"
            );
        }

        this.reference = reference;
        this.nombrePlacesContractuelles =
                nombrePlacesContractuelles;
        this.clientEntreprise = clientEntreprise;
        this.statut = StatutContrat.EN_PREPARATION;
    }

    @PrePersist
    protected void avantCreation() {
        LocalDateTime maintenant = LocalDateTime.now();

        if (statut == null) {
            statut = StatutContrat.EN_PREPARATION;
        }

        dateCreation = maintenant;
        dateModification = maintenant;
    }

    @PreUpdate
    protected void avantModification() {
        dateModification = LocalDateTime.now();
    }

    public void remettreAuClient() {
        verifierStatut(StatutContrat.EN_PREPARATION);

        statut = StatutContrat.REMIS_AU_CLIENT;
        dateRemiseAuClient = LocalDateTime.now();
    }

    public void enregistrerRetourSigneLegalise() {
        verifierStatut(StatutContrat.REMIS_AU_CLIENT);

        statut = StatutContrat.RETOURNE_SIGNE_LEGALISE;
        dateRetourSigneLegalise = LocalDateTime.now();
    }

    public void enregistrerSignatureDG(
            Utilisateur signataire
    ) {
        verifierStatut(
                StatutContrat.RETOURNE_SIGNE_LEGALISE
        );

        if (signataire == null) {
            throw new IllegalArgumentException(
                    "Le signataire est obligatoire"
            );
        }

        signePar = signataire;
        dateSignatureDG = LocalDateTime.now();
        statut = StatutContrat.SIGNE_PAR_DG;
    }

    public void activer(
            LocalDate nouvelleDateDebut,
            LocalDate nouvelleDateFin
    ) {
        verifierStatut(StatutContrat.SIGNE_PAR_DG);
        verifierDates(
                nouvelleDateDebut,
                nouvelleDateFin
        );

        dateDebut = nouvelleDateDebut;
        dateFin = nouvelleDateFin;
        statut = StatutContrat.ACTIF;
    }

    public void marquerExpire() {
        verifierStatut(StatutContrat.ACTIF);
        statut = StatutContrat.EXPIRE;
    }

    public void resilier(String motif) {
        verifierStatut(StatutContrat.ACTIF);

        if (motif == null || motif.isBlank()) {
            throw new IllegalArgumentException(
                    "Le motif de résiliation est obligatoire"
            );
        }

        statut = StatutContrat.RESILIE;
    }

    private void verifierStatut(StatutContrat attendu) {
        if (statut != attendu) {
            throw new IllegalStateException(
                    "Transition impossible depuis le statut "
                            + statut
            );
        }
    }

    private void verifierDates(
            LocalDate debut,
            LocalDate fin
    ) {
        if (debut == null || fin == null) {
            throw new IllegalArgumentException(
                    "Les dates du contrat sont obligatoires"
            );
        }

        if (fin.isBefore(debut)) {
            throw new IllegalArgumentException(
                    "La date de fin ne peut pas précéder la date de début"
            );
        }
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public StatutContrat getStatut() {
        return statut;
    }

    public Integer getNombrePlacesContractuelles() {
        return nombrePlacesContractuelles;
    }

    public ClientEntreprise getClientEntreprise() {
        return clientEntreprise;
    }

    public Utilisateur getSignePar() {
        return signePar;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public LocalDateTime getDateRemiseAuClient() {
        return dateRemiseAuClient;
    }

    public LocalDateTime getDateRetourSigneLegalise() {
        return dateRetourSigneLegalise;
    }

    public LocalDateTime getDateSignatureDG() {
        return dateSignatureDG;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }
}