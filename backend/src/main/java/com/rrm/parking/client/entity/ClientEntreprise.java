package com.rrm.parking.client.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "client_entreprise",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_client_entreprise_ice",
                        columnNames = "ice"
                )
        }
)
@PrimaryKeyJoinColumn(name = "id")
public class ClientEntreprise extends Client {

    @Column(nullable = false, length = 200)
    private String raisonSociale;

    @Column(nullable = false, length = 15)
    private String ice;

    @Column(length = 50)
    private String numeroRC;

    @Column(nullable = false, length = 500)
    private String adresseSiege;

    @Column(length = 200)
    private String nomContactPrincipal;

    @Column(length = 150)
    private String fonctionContactPrincipal;

    protected ClientEntreprise() {
    }

    public ClientEntreprise(
            String raisonSociale,
            String ice,
            String numeroRC,
            String adresseSiege,
            String nomContactPrincipal
    ) {
        this.raisonSociale = raisonSociale;
        this.ice = ice;
        this.numeroRC = numeroRC;
        this.adresseSiege = adresseSiege;
        this.nomContactPrincipal = nomContactPrincipal;
    }

    public String getRaisonSociale() {
        return raisonSociale;
    }

    public void setRaisonSociale(String raisonSociale) {
        this.raisonSociale = raisonSociale;
    }

    public String getIce() {
        return ice;
    }

    public void setIce(String ice) {
        this.ice = ice;
    }

    public String getNumeroRC() {
        return numeroRC;
    }

    public void setNumeroRC(String numeroRC) {
        this.numeroRC = numeroRC;
    }

    public String getAdresseSiege() {
        return adresseSiege;
    }

    public void setAdresseSiege(String adresseSiege) {
        this.adresseSiege = adresseSiege;
    }

    public String getNomContactPrincipal() {
        return nomContactPrincipal;
    }

    public void setNomContactPrincipal(String nomContactPrincipal) {
        this.nomContactPrincipal = nomContactPrincipal;
    }

    public String getFonctionContactPrincipal() {
        return fonctionContactPrincipal;
    }

    public void setFonctionContactPrincipal(String fonctionContactPrincipal) {
        this.fonctionContactPrincipal = fonctionContactPrincipal;
    }
    public ClientEntreprise(
            String raisonSociale,
            String ice,
            String adresseSiege
    ) {
        this.raisonSociale = raisonSociale;
        this.ice = ice;
        this.adresseSiege = adresseSiege;
    }
}
