package com.rrm.parking.demande.dto.request;

import com.rrm.parking.demande.enums.CanalOtp;
import com.rrm.parking.paiement.enums.ModePaiement;
import com.rrm.parking.vehicule.enums.TypeVehicule;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class DemandeAbonnementRegulierRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void initialiserValidateur() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void accepteLesDeuxFormatsDeTelephoneMarocain() {
        assertThat(violationsPourTelephone("0615914461")).isEmpty();
        assertThat(violationsPourTelephone("615914461")).isEmpty();
    }

    @Test
    void refuseUnTelephoneMarocainIncomplet() {
        assertThat(violationsPourTelephone("61591446")).isNotEmpty();
    }

    @Test
    void accepteLesBornesDuMatricule() {
        assertThat(violationsPourMatricule("123", "أ", "1")).isEmpty();
        assertThat(violationsPourMatricule("1234567", "ش", "99")).isEmpty();
    }

    @Test
    void refuseLesMatriculesHorsBornes() {
        assertThat(violationsPourMatricule("12", "أ", "1")).isNotEmpty();
        assertThat(violationsPourMatricule("12345678", "أ", "1")).isNotEmpty();
        assertThat(violationsPourMatricule("123", "AB", "1")).isNotEmpty();
        assertThat(violationsPourMatricule("123", "أ", "100")).isNotEmpty();
    }

    @Test
    void accepteUnAbonnementRegulierAuNomDuneEntreprise() {
        DemandeAbonnementRegulierRequest personnel = requeteValide("0615914461", "123", "أ", "1");
        DemandeAbonnementRegulierRequest entreprise = avecEntreprise(personnel, "Société Exemple", "001234567890123");
        assertThat(validator.validate(entreprise)).isEmpty();
    }

    @Test
    void refuseUneIdentiteEntrepriseIncompletOuUnIceInvalide() {
        DemandeAbonnementRegulierRequest personnel = requeteValide("0615914461", "123", "أ", "1");
        assertThat(validator.validate(avecEntreprise(personnel, "Société Exemple", null))).isNotEmpty();
        assertThat(validator.validate(avecEntreprise(personnel, null, "001234567890123"))).isNotEmpty();
        assertThat(validator.validate(avecEntreprise(personnel, "Société Exemple", "123"))).isNotEmpty();
    }

    private DemandeAbonnementRegulierRequest avecEntreprise(
            DemandeAbonnementRegulierRequest source, String nom, String ice
    ) {
        return new DemandeAbonnementRegulierRequest(
                source.nom(), source.prenom(), source.cin(), source.telephone(), source.email(),
                source.numeroImmatriculation(), source.serieImmatriculation(), source.codeRegion(),
                source.marque(), source.modele(), source.couleur(), source.typeVehicule(),
                source.tarifParkingId(), source.modePaiement(), source.canalOtp(),
                source.conditionsAcceptees(), nom, ice
        );
    }

    private Set<ConstraintViolation<DemandeAbonnementRegulierRequest>> violationsPourTelephone(
            String telephone
    ) {
        return validator.validate(requeteValide(telephone, "123", "أ", "1"));
    }

    private Set<ConstraintViolation<DemandeAbonnementRegulierRequest>> violationsPourMatricule(
            String numero,
            String serie,
            String region
    ) {
        return validator.validate(requeteValide("0615914461", numero, serie, region));
    }

    private DemandeAbonnementRegulierRequest requeteValide(
            String telephone,
            String numero,
            String serie,
            String region
    ) {
        return new DemandeAbonnementRegulierRequest(
                "Bennani",
                "Karim",
                "AB123456",
                telephone,
                "karim@example.ma",
                numero,
                serie,
                region,
                "Dacia",
                "Logan",
                "Blanc",
                TypeVehicule.VOITURE,
                1L,
                ModePaiement.ESPECE,
                CanalOtp.EMAIL,
                true
        );
    }
}
