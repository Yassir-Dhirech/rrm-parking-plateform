package com.rrm.parking.audit.entity;

import com.rrm.parking.audit.enums.ResultatAudit;
import com.rrm.parking.audit.enums.TypeActionAudit;
import com.rrm.parking.parking.entity.Parking;
import com.rrm.parking.utilisateur.entity.Utilisateur;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Immutable
@Table(
        name = "audit_log",
        indexes = {
                @Index(
                        name = "idx_audit_log_date",
                        columnList = "date_evenement"
                ),
                @Index(
                        name = "idx_audit_log_acteur",
                        columnList = "acteur_utilisateur_id"
                ),
                @Index(
                        name = "idx_audit_log_action",
                        columnList = "type_action"
                ),
                @Index(
                        name = "idx_audit_log_objet",
                        columnList = "type_objet, objet_id"
                ),
                @Index(
                        name = "idx_audit_log_parking",
                        columnList = "parking_id"
                )
        }
)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "date_evenement",
            nullable = false,
            updatable = false
    )
    private LocalDateTime dateEvenement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "acteur_utilisateur_id",
            updatable = false,
            foreignKey = @ForeignKey(
                    name = "fk_audit_log_utilisateur"
            )
    )
    private Utilisateur acteur;

    /*
     * Instantané de l'identifiant utilisé.
     * Utile notamment lorsqu'une authentification échoue
     * et qu'aucun Utilisateur n'a pu être identifié.
     */
    @Column(
            name = "identifiant_acteur",
            length = 255,
            updatable = false
    )
    private String identifiantActeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "parking_id",
            updatable = false,
            foreignKey = @ForeignKey(
                    name = "fk_audit_log_parking"
            )
    )
    private Parking parking;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "type_action",
            nullable = false,
            length = 50,
            updatable = false
    )
    private TypeActionAudit typeAction;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20,
            updatable = false
    )
    private ResultatAudit resultat;

    @Column(
            name = "type_objet",
            length = 100,
            updatable = false
    )
    private String typeObjet;

    @Column(
            name = "objet_id",
            updatable = false
    )
    private Long objetId;

    @Column(
            name = "reference_objet",
            length = 100,
            updatable = false
    )
    private String referenceObjet;

    @Column(
            nullable = false,
            length = 1000,
            updatable = false
    )
    private String message;

    /*
     * Ne doit jamais contenir de mot de passe,
     * JWT, secret, OTP ou document complet.
     */
    @Column(
            name = "details_techniques",
            length = 4000,
            updatable = false
    )
    private String detailsTechniques;

    @Column(
            name = "adresse_ip",
            length = 64,
            updatable = false
    )
    private String adresseIp;

    @Column(
            name = "user_agent",
            length = 1000,
            updatable = false
    )
    private String userAgent;

    @Column(
            name = "methode_http",
            length = 10,
            updatable = false
    )
    private String methodeHttp;

    @Column(
            name = "chemin_requete",
            length = 1000,
            updatable = false
    )
    private String cheminRequete;

    @Column(
            name = "correlation_id",
            length = 100,
            updatable = false
    )
    private String correlationId;

    protected AuditLog() {
        // Constructeur JPA
    }

    public AuditLog(
            Utilisateur acteur,
            String identifiantActeur,
            Parking parking,
            TypeActionAudit typeAction,
            ResultatAudit resultat,
            String typeObjet,
            Long objetId,
            String referenceObjet,
            String message,
            String detailsTechniques,
            String adresseIp,
            String userAgent,
            String methodeHttp,
            String cheminRequete,
            String correlationId
    ) {
        this.acteur = acteur;
        this.identifiantActeur =
                nettoyer(identifiantActeur);
        this.parking = parking;

        this.typeAction = exigerNonNull(
                typeAction,
                "Le type d'action est obligatoire"
        );

        this.resultat = exigerNonNull(
                resultat,
                "Le résultat est obligatoire"
        );

        this.typeObjet = nettoyer(typeObjet);
        this.objetId = objetId;
        this.referenceObjet =
                nettoyer(referenceObjet);

        this.message = exigerTexte(
                message,
                "Le message d'audit est obligatoire"
        );

        this.detailsTechniques =
                nettoyer(detailsTechniques);
        this.adresseIp = nettoyer(adresseIp);
        this.userAgent = nettoyer(userAgent);
        this.methodeHttp =
                normaliserMethodeHttp(methodeHttp);
        this.cheminRequete =
                nettoyer(cheminRequete);
        this.correlationId =
                nettoyer(correlationId);

        this.dateEvenement = LocalDateTime.now();
    }

    @PrePersist
    private void verifierAvantCreation() {
        if (dateEvenement == null) {
            dateEvenement = LocalDateTime.now();
        }

        if (typeAction == null
                || resultat == null
                || message == null
                || message.isBlank()) {
            throw new IllegalStateException(
                    "L'événement d'audit est incomplet"
            );
        }

        /*
         * Pour une action authentifiée, acteur est renseigné.
         * Pour une connexion échouée, seul identifiantActeur
         * peut être connu.
         */
        if (acteur == null
                && (identifiantActeur == null
                || identifiantActeur.isBlank())) {
            throw new IllegalStateException(
                    "L'acteur ou son identifiant est obligatoire"
            );
        }
    }

    private static String normaliserMethodeHttp(
            String methode
    ) {
        String valeur = nettoyer(methode);

        if (valeur == null) {
            return null;
        }

        return valeur.toUpperCase();
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

    public LocalDateTime getDateEvenement() {
        return dateEvenement;
    }

    public Utilisateur getActeur() {
        return acteur;
    }

    public String getIdentifiantActeur() {
        return identifiantActeur;
    }

    public Parking getParking() {
        return parking;
    }

    public TypeActionAudit getTypeAction() {
        return typeAction;
    }

    public ResultatAudit getResultat() {
        return resultat;
    }

    public String getTypeObjet() {
        return typeObjet;
    }

    public Long getObjetId() {
        return objetId;
    }

    public String getReferenceObjet() {
        return referenceObjet;
    }

    public String getMessage() {
        return message;
    }

    public String getDetailsTechniques() {
        return detailsTechniques;
    }

    public String getAdresseIp() {
        return adresseIp;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public String getMethodeHttp() {
        return methodeHttp;
    }

    public String getCheminRequete() {
        return cheminRequete;
    }

    public String getCorrelationId() {
        return correlationId;
    }
}