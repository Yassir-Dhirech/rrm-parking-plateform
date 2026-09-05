package com.rrm.parking.demande.entity;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.demande.enums.CanalInitiation;
import com.rrm.parking.demande.enums.StatutDemande;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;
import com.rrm.parking.demande.enums.OrigineTransition;
import java.util.ArrayList;
import java.util.Collections;
import com.rrm.parking.demande.enums.StatutOtp;
import java.util.List;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "demande_client",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_demande_client_reference",
                        columnNames = "reference"
                )
        }
)
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class DemandeClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private StatutDemande statut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CanalInitiation canalInitiation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_demande_client_client"
            )
    )
    private Client client;

    @OneToMany(
            mappedBy = "demande",
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            }
    )
    @OrderBy("dateCreation ASC")
    private List<VerificationOtp> verificationsOtp =
            new ArrayList<>();

    @OneToMany(
            mappedBy = "demande",
            cascade = {
                    CascadeType.PERSIST,
                    CascadeType.MERGE
            }
    )
    @OrderBy("dateChangement ASC")
    private List<HistoriqueStatutDemande> historiqueStatuts =
            new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "initiee_par_utilisateur_id",
            foreignKey = @ForeignKey(
                    name = "fk_demande_client_utilisateur"
            )
    )
    private Utilisateur initieePar;

    private LocalDateTime dateValidationOtp;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    private LocalDateTime dateSoumission;

    @Column(nullable = false)
    private LocalDateTime dateModification;

    @Column(length = 1000)
    private String motifRefus;

    protected DemandeClient() {
    }

    protected DemandeClient(
            String reference,
            CanalInitiation canalInitiation,
            Client client,
            Utilisateur initieePar
    ) {
        if (reference == null || reference.isBlank()) {
            throw new IllegalArgumentException(
                    "La référence est obligatoire"
            );
        }

        this.canalInitiation = Objects.requireNonNull(
                canalInitiation,
                "Le canal d'initiation est obligatoire"
        );

        this.client = Objects.requireNonNull(
                client,
                "Le client est obligatoire"
        );

        verifierInitiateur(canalInitiation, initieePar);
        this.reference = reference;
        this.initieePar = initieePar;
    }

    @PrePersist
    protected void avantCreation() {
        if (statut == null) {
            throw new IllegalStateException(
                    "La demande doit être soumise avant son enregistrement"
            );
        }

        LocalDateTime maintenant = LocalDateTime.now();
        dateCreation = maintenant;
        dateModification = maintenant;
    }

    @PreUpdate
    protected void avantModification() {
        dateModification = LocalDateTime.now();
    }

    public void soumettre() {
        if (statut != null) {
            throw new IllegalStateException(
                    "La demande a déjà été soumise"
            );
        }

        OrigineTransition origine;
        Utilisateur utilisateur;

        if (canalInitiation == CanalInitiation.EN_LIGNE) {
            origine = OrigineTransition.CLIENT;
            utilisateur = null;
        } else {
            origine = OrigineTransition.UTILISATEUR_INTERNE;
            utilisateur = initieePar;
        }

        dateSoumission = LocalDateTime.now();

        appliquerTransition(
                StatutDemande.SOUMISE,
                origine,
                utilisateur,
                null
        );
    }

    public void confirmerOtp() {
        verifierStatutActuel(StatutDemande.SOUMISE);

        dateValidationOtp = LocalDateTime.now();

        appliquerTransition(
                StatutDemande.EN_ATTENTE_PAIEMENT,
                OrigineTransition.CLIENT,
                null,
                "Validation du code OTP"
        );
    }

    public void marquerPayee(Utilisateur agent) {
        verifierStatutActuel(
                StatutDemande.EN_ATTENTE_PAIEMENT
        );

        Objects.requireNonNull(
                agent,
                "L'agent ayant enregistré le paiement est obligatoire"
        );

        appliquerTransition(
                StatutDemande.PAYEE,
                OrigineTransition.UTILISATEUR_INTERNE,
                agent,
                "Paiement enregistré"
        );
    }

    protected void verifierModifiableAvantPaiement() {
        if (statut != StatutDemande.SOUMISE
                && statut != StatutDemande.EN_ATTENTE_PAIEMENT) {
            throw new IllegalStateException(
                    "La demande ne peut plus être modifiée après le paiement"
            );
        }
    }

    private void verifierStatutActuel(
            StatutDemande statutAttendu
    ) {
        if (statut != statutAttendu) {
            throw new IllegalStateException(
                    "Opération impossible depuis le statut " + statut
            );
        }
    }

    public void valider(
            Utilisateur utilisateur,
            String commentaire
    ) {
        verifierStatutActuel(StatutDemande.PAYEE);

        Objects.requireNonNull(
                utilisateur,
                "L'utilisateur ayant validé la demande est obligatoire"
        );

        appliquerTransition(
                StatutDemande.VALIDEE,
                OrigineTransition.UTILISATEUR_INTERNE,
                utilisateur,
                commentaire
        );
    }

    public void expirer() {
        verifierStatutActuel(
                StatutDemande.EN_ATTENTE_PAIEMENT
        );

        appliquerTransition(
                StatutDemande.EXPIREE,
                OrigineTransition.SYSTEME,
                null,
                "Demande expirée faute de paiement sous sept jours"
        );
    }

    public void changerStatut(
            StatutDemande nouveauStatut,
            OrigineTransition origine,
            Utilisateur effectuePar,
            String motif
    ) {
        Objects.requireNonNull(
                nouveauStatut,
                "Le nouveau statut est obligatoire"
        );

        if (nouveauStatut == StatutDemande.REFUSEE) {
            throw new IllegalArgumentException(
                    "Utilisez refuser() pour refuser la demande"
            );
        }

        if (nouveauStatut == StatutDemande.ANNULEE) {
            throw new IllegalArgumentException(
                    "Utilisez annuler() pour annuler la demande"
            );
        }

        appliquerTransition(
                nouveauStatut,
                origine,
                effectuePar,
                motif
        );
    }

    public void refuser(
            String motif,
            OrigineTransition origine,
            Utilisateur effectuePar
    ) {
        if (motif == null || motif.isBlank()) {
            throw new IllegalArgumentException(
                    "Le motif de refus est obligatoire"
            );
        }

        motifRefus = motif;

        appliquerTransition(
                StatutDemande.REFUSEE,
                origine,
                effectuePar,
                motif
        );
    }

    public void annuler(
            OrigineTransition origine,
            Utilisateur effectuePar,
            String motif
    ) {
        appliquerTransition(
                StatutDemande.ANNULEE,
                origine,
                effectuePar,
                motif
        );
    }

    public LocalDateTime getDateValidationOtp() {
        return dateValidationOtp;
    }

    private void appliquerTransition(
            StatutDemande nouveauStatut,
            OrigineTransition origine,
            Utilisateur effectuePar,
            String motif
    ) {
        Objects.requireNonNull(
                nouveauStatut,
                "Le nouveau statut est obligatoire"
        );

        Objects.requireNonNull(
                origine,
                "L'origine est obligatoire"
        );

        if (statut == null
                && nouveauStatut != StatutDemande.SOUMISE) {
            throw new IllegalStateException(
                    "La première transition doit être SOUMISE"
            );
        }

        if (statut != null && estTerminee()) {
            throw new IllegalStateException(
                    "Une demande terminée ne peut plus changer de statut"
            );
        }

        if (statut == nouveauStatut) {
            throw new IllegalStateException(
                    "La demande possède déjà ce statut"
            );
        }

        HistoriqueStatutDemande historique =
                new HistoriqueStatutDemande(
                        this,
                        statut,
                        nouveauStatut,
                        origine,
                        effectuePar,
                        motif
                );

        statut = nouveauStatut;
        historiqueStatuts.add(historique);
    }

    public List<HistoriqueStatutDemande>
    getHistoriqueStatuts() {
        return Collections.unmodifiableList(
                historiqueStatuts
        );
    }

    public boolean estTerminee() {
        return statut == StatutDemande.VALIDEE
                || statut == StatutDemande.REFUSEE
                || statut == StatutDemande.EXPIREE
                || statut == StatutDemande.ANNULEE;
    }

    private void verifierInitiateur(
            CanalInitiation canal,
            Utilisateur utilisateur
    ) {
        if (canal == CanalInitiation.ASSISTE_PAR_AGENT
                && utilisateur == null) {
            throw new IllegalArgumentException(
                    "Un utilisateur interne est obligatoire pour une demande assistée"
            );
        }

        if (canal == CanalInitiation.EN_LIGNE
                && utilisateur != null) {
            throw new IllegalArgumentException(
                    "Une demande en ligne ne doit pas avoir d'agent initiateur"
            );
        }
    }

    public void ajouterVerificationOtp(
            VerificationOtp verificationOtp
    ) {
        Objects.requireNonNull(
                verificationOtp,
                "La vérification OTP est obligatoire"
        );

        if (verificationOtp.getDemande() != this) {
            throw new IllegalArgumentException(
                    "La vérification OTP doit appartenir à cette demande"
            );
        }

        verificationsOtp.stream()
                .filter(verification ->
                        verification.getStatut()
                                == StatutOtp.EN_ATTENTE
                )
                .forEach(VerificationOtp::annuler);

        verificationsOtp.add(verificationOtp);
    }

    public List<VerificationOtp> getVerificationsOtp() {
        return Collections.unmodifiableList(
                verificationsOtp
        );
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public StatutDemande getStatut() {
        return statut;
    }

    public CanalInitiation getCanalInitiation() {
        return canalInitiation;
    }

    public Client getClient() {
        return client;
    }

    public Utilisateur getInitieePar() {
        return initieePar;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateSoumission() {
        return dateSoumission;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public String getMotifRefus() {
        return motifRefus;
    }
}