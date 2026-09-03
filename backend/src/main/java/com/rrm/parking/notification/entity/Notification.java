package com.rrm.parking.notification.entity;

import com.rrm.parking.client.entity.Client;
import com.rrm.parking.notification.enums.CanalNotification;
import com.rrm.parking.notification.enums.StatutNotification;
import com.rrm.parking.notification.enums.TypeNotification;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(
        name = "notification",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_notification_reference",
                        columnNames = "reference"
                )
        },
        indexes = {
                @Index(
                        name = "idx_notification_statut",
                        columnList = "statut"
                ),
                @Index(
                        name = "idx_notification_date_prevue",
                        columnList = "date_envoi_prevue"
                ),
                @Index(
                        name = "idx_notification_client",
                        columnList = "client_destinataire_id"
                ),
                @Index(
                        name = "idx_notification_utilisateur",
                        columnList = "utilisateur_destinataire_id"
                )
        }
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_notification", nullable = false, length = 40)
    private TypeNotification typeNotification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CanalNotification canal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutNotification statut;

    @Column(nullable = false, length = 200)
    private String sujet;

    @Column(nullable = false, length = 4000)
    private String contenu;

    /*
     * Adresse utilisée au moment de l'envoi :
     * e-mail, numéro SMS ou numéro WhatsApp.
     * Elle reste conservée comme instantané historique.
     */
    @Column(name = "adresse_destination", nullable = false, length = 255)
    private String adresseDestination;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "client_destinataire_id",
            foreignKey = @ForeignKey(
                    name = "fk_notification_client"
            )
    )
    private Client clientDestinataire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "utilisateur_destinataire_id",
            foreignKey = @ForeignKey(
                    name = "fk_notification_utilisateur"
            )
    )
    private Utilisateur utilisateurDestinataire;

    /*
     * Exemple : référence d'une demande, facture,
     * carte ou abonnement associé à la notification.
     */
    @Column(name = "reference_metier", length = 100)
    private String referenceMetier;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_envoi_prevue", nullable = false)
    private LocalDateTime dateEnvoiPrevue;

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi;

    @Column(name = "nombre_tentatives", nullable = false)
    private Integer nombreTentatives;

    @Column(name = "derniere_erreur", length = 2000)
    private String derniereErreur;

    @Version
    @Column(nullable = false)
    private Long version;

    protected Notification() {
        // Constructeur JPA
    }

    public static Notification pourClient(
            String reference,
            TypeNotification typeNotification,
            CanalNotification canal,
            String sujet,
            String contenu,
            String adresseDestination,
            Client client,
            String referenceMetier,
            LocalDateTime dateEnvoiPrevue
    ) {
        Notification notification = creerBase(
                reference,
                typeNotification,
                canal,
                sujet,
                contenu,
                adresseDestination,
                referenceMetier,
                dateEnvoiPrevue
        );

        notification.clientDestinataire = exigerNonNull(
                client,
                "Le client destinataire est obligatoire"
        );

        return notification;
    }

    public static Notification pourUtilisateur(
            String reference,
            TypeNotification typeNotification,
            CanalNotification canal,
            String sujet,
            String contenu,
            String adresseDestination,
            Utilisateur utilisateur,
            String referenceMetier,
            LocalDateTime dateEnvoiPrevue
    ) {
        Notification notification = creerBase(
                reference,
                typeNotification,
                canal,
                sujet,
                contenu,
                adresseDestination,
                referenceMetier,
                dateEnvoiPrevue
        );

        notification.utilisateurDestinataire =
                exigerNonNull(
                        utilisateur,
                        "L'utilisateur destinataire est obligatoire"
                );

        return notification;
    }

    private static Notification creerBase(
            String reference,
            TypeNotification typeNotification,
            CanalNotification canal,
            String sujet,
            String contenu,
            String adresseDestination,
            String referenceMetier,
            LocalDateTime dateEnvoiPrevue
    ) {
        Notification notification = new Notification();

        notification.reference =
                normaliserReference(reference);

        notification.typeNotification = exigerNonNull(
                typeNotification,
                "Le type de notification est obligatoire"
        );

        notification.canal = exigerNonNull(
                canal,
                "Le canal de notification est obligatoire"
        );

        notification.sujet = exigerTexte(
                sujet,
                "Le sujet est obligatoire"
        );

        notification.contenu = exigerTexte(
                contenu,
                "Le contenu est obligatoire"
        );

        notification.adresseDestination = exigerTexte(
                adresseDestination,
                "L'adresse de destination est obligatoire"
        );

        notification.referenceMetier =
                nettoyer(referenceMetier);

        notification.dateCreation = LocalDateTime.now();

        notification.dateEnvoiPrevue =
                dateEnvoiPrevue != null
                        ? dateEnvoiPrevue
                        : notification.dateCreation;

        notification.nombreTentatives = 0;
        notification.statut = StatutNotification.A_ENVOYER;

        return notification;
    }

    public boolean estPretePourEnvoi(
            LocalDateTime maintenant
    ) {
        LocalDateTime instant = exigerNonNull(
                maintenant,
                "La date de vérification est obligatoire"
        );

        return statut == StatutNotification.A_ENVOYER
                && !dateEnvoiPrevue.isAfter(instant);
    }

    public void marquerCommeEnvoyee() {
        if (statut != StatutNotification.A_ENVOYER
                && statut != StatutNotification.ECHEC) {
            throw new IllegalStateException(
                    "La notification ne peut pas être envoyée"
            );
        }

        this.nombreTentatives++;
        this.statut = StatutNotification.ENVOYEE;
        this.dateEnvoi = LocalDateTime.now();
        this.derniereErreur = null;
    }

    public void marquerEchec(String erreur) {
        if (statut == StatutNotification.ENVOYEE
                || statut == StatutNotification.ANNULEE) {
            throw new IllegalStateException(
                    "La notification est dans un état définitif"
            );
        }

        this.nombreTentatives++;
        this.statut = StatutNotification.ECHEC;
        this.derniereErreur = exigerTexte(
                erreur,
                "La description de l'erreur est obligatoire"
        );
    }

    public void reprogrammer(
            LocalDateTime nouvelleDate
    ) {
        if (statut != StatutNotification.ECHEC
                && statut != StatutNotification.A_ENVOYER) {
            throw new IllegalStateException(
                    "La notification ne peut pas être reprogrammée"
            );
        }

        this.dateEnvoiPrevue = exigerNonNull(
                nouvelleDate,
                "La nouvelle date est obligatoire"
        );

        this.statut = StatutNotification.A_ENVOYER;
        this.derniereErreur = null;
    }

    public void annuler() {
        if (statut == StatutNotification.ENVOYEE) {
            throw new IllegalStateException(
                    "Une notification envoyée ne peut pas être annulée"
            );
        }

        if (statut == StatutNotification.ANNULEE) {
            throw new IllegalStateException(
                    "La notification est déjà annulée"
            );
        }

        this.statut = StatutNotification.ANNULEE;
    }

    @PrePersist
    @PreUpdate
    private void verifierCoherence() {
        boolean clientPresent =
                clientDestinataire != null;

        boolean utilisateurPresent =
                utilisateurDestinataire != null;

        if (clientPresent == utilisateurPresent) {
            throw new IllegalStateException(
                    "La notification doit avoir exactement un destinataire : client ou utilisateur"
            );
        }

        if (reference == null
                || typeNotification == null
                || canal == null
                || statut == null
                || dateCreation == null
                || dateEnvoiPrevue == null
                || nombreTentatives == null) {
            throw new IllegalStateException(
                    "La notification est incomplète"
            );
        }

        if (nombreTentatives < 0) {
            throw new IllegalStateException(
                    "Le nombre de tentatives est invalide"
            );
        }
    }

    private static String normaliserReference(
            String reference
    ) {
        return exigerTexte(
                reference,
                "La référence est obligatoire"
        ).toUpperCase(Locale.ROOT);
    }

    private static String nettoyer(String valeur) {
        if (valeur == null || valeur.isBlank()) {
            return null;
        }

        return valeur.trim();
    }

    private static String exigerTexte(
            String valeur,
            String message
    ) {
        if (valeur == null || valeur.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return valeur.trim();
    }

    private static <T> T exigerNonNull(
            T valeur,
            String message
    ) {
        if (valeur == null) {
            throw new IllegalArgumentException(message);
        }

        return valeur;
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public TypeNotification getTypeNotification() {
        return typeNotification;
    }

    public CanalNotification getCanal() {
        return canal;
    }

    public StatutNotification getStatut() {
        return statut;
    }

    public String getSujet() {
        return sujet;
    }

    public String getContenu() {
        return contenu;
    }

    public String getAdresseDestination() {
        return adresseDestination;
    }

    public Client getClientDestinataire() {
        return clientDestinataire;
    }

    public Utilisateur getUtilisateurDestinataire() {
        return utilisateurDestinataire;
    }

    public String getReferenceMetier() {
        return referenceMetier;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateEnvoiPrevue() {
        return dateEnvoiPrevue;
    }

    public LocalDateTime getDateEnvoi() {
        return dateEnvoi;
    }

    public Integer getNombreTentatives() {
        return nombreTentatives;
    }

    public String getDerniereErreur() {
        return derniereErreur;
    }

    public Long getVersion() {
        return version;
    }
}