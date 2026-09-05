package com.rrm.parking.demande.entity;

import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.demande.enums.StatutOtp;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "verification_otp",
        indexes = {
                @Index(
                        name = "idx_verification_otp_demande",
                        columnList = "demande_id"
                ),
                @Index(
                        name = "idx_verification_otp_expiration",
                        columnList = "date_expiration"
                )
        }
)
public class VerificationOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String codeHash;

    @NotNull(message = "Le canal d'envoi du code OTP est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20,
            columnDefinition = "VARCHAR(20)"
    )
    private CanalOtp canal;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20,
            columnDefinition = "VARCHAR(20)"
    )
    private StatutOtp statut;

    @Column(nullable = false)
    private Integer nombreTentatives;

    private static final int NOMBRE_MAX_TENTATIVES = 3;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @Column(nullable = false)
    private LocalDateTime dateExpiration;

    private LocalDateTime dateValidation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "demande_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_verification_otp_demande"
            )
    )
    private DemandeClient demande;

    protected VerificationOtp() {
    }

    public VerificationOtp(
            String codeHash,
            CanalOtp canal,
            LocalDateTime dateExpiration,
            DemandeClient demande
    ) {
        if (codeHash == null || codeHash.isBlank()) {
            throw new IllegalArgumentException(
                    "Le hash du code OTP est obligatoire"
            );
        }

        if (dateExpiration == null
                || !dateExpiration.isAfter(
                LocalDateTime.now()
        )) {
            throw new IllegalArgumentException(
                    "La date d'expiration doit être future"
            );
        }

        this.codeHash = codeHash;
        this.canal = Objects.requireNonNull(
                canal,
                "Le canal OTP est obligatoire"
        );
        this.dateExpiration = dateExpiration;
        this.demande = Objects.requireNonNull(
                demande,
                "La demande est obligatoire"
        );
        this.statut = StatutOtp.EN_ATTENTE;
        this.nombreTentatives = 0;
    }

    @PrePersist
    protected void avantCreation() {
        if (statut == null) {
            statut = StatutOtp.EN_ATTENTE;
        }

        if (nombreTentatives == null) {
            nombreTentatives = 0;
        }

        dateCreation = LocalDateTime.now();
    }

    public boolean estExpire() {
        return statut == StatutOtp.EXPIRE
                || LocalDateTime.now()
                .isAfter(dateExpiration);
    }

    public void marquerExpire() {
        verifierEnAttente();
        statut = StatutOtp.EXPIRE;
    }

    public int getNombreTentativesRestantes() {
        return Math.max(
                0,
                NOMBRE_MAX_TENTATIVES - nombreTentatives
        );
    }

    public void enregistrerEchec() {
        verifierEnAttente();

        if (estExpire()) {
            statut = StatutOtp.EXPIRE;
            return;
        }

        nombreTentatives++;

        if (nombreTentatives
                >= NOMBRE_MAX_TENTATIVES) {
            statut = StatutOtp.BLOQUE;
        }
    }



    public void marquerValide() {
        verifierEnAttente();

        if (estExpire()) {
            statut = StatutOtp.EXPIRE;
            return;
        }

        statut = StatutOtp.VALIDE;
        dateValidation = LocalDateTime.now();
    }

    public void bloquer() {
        verifierEnAttente();
        statut = StatutOtp.BLOQUE;
    }

    public void annuler() {
        verifierEnAttente();
        statut = StatutOtp.ANNULE;
    }

    private void verifierEnAttente() {
        if (statut != StatutOtp.EN_ATTENTE) {
            throw new IllegalStateException(
                    "La vérification OTP n'est plus en attente"
            );
        }
    }

    public Long getId() {
        return id;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public CanalOtp getCanal() {
        return canal;
    }

    public StatutOtp getStatut() {
        return statut;
    }

    public Integer getNombreTentatives() {
        return nombreTentatives;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public LocalDateTime getDateExpiration() {
        return dateExpiration;
    }

    public LocalDateTime getDateValidation() {
        return dateValidation;
    }

    public DemandeClient getDemande() {
        return demande;
    }
}