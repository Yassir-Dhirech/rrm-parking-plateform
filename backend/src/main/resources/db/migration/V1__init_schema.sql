-- =====================================================================
-- V1__init_schema.sql
-- RRM - Plateforme de Gestion des Abonnements de Parking
-- Initial database schema (Flyway migration)
-- =====================================================================

-- =====================================================================
-- 1. UTILISATEURS
-- =====================================================================
CREATE TABLE utilisateursxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxRxxxxxxxxxxxxx (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('AGENT','SUPERVISEUR','RESPONSABLE','COMPTABLE','RESP_REPORTING','ADMIN_SI') NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    derniere_connexion DATETIME NULL,
    version BIGINT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 2. PARKINGS
-- =====================================================================
CREATE TABLE parkings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    nom VARCHAR(150) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    zone VARCHAR(100) NULL,
    capacite_totale INT NOT NULL DEFAULT 0,
    capacite_reservee_abonnement INT NOT NULL DEFAULT 0,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 3. UTILISATEUR_PARKINGS (junction N:N — assignation agents/superviseurs)
-- =====================================================================
CREATE TABLE utilisateur_parkings (
    utilisateur_id BIGINT NOT NULL,
    parking_id BIGINT NOT NULL,
    PRIMARY KEY (utilisateur_id, parking_id),
    CONSTRAINT fk_up_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    CONSTRAINT fk_up_parking FOREIGN KEY (parking_id) REFERENCES parkings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 4. PLANS_TARIFAIRES
-- =====================================================================
CREATE TABLE plans_tarifaires (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    duree ENUM('3_MOIS','6_MOIS','9_MOIS','12_MOIS') NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    type_vehicule ENUM('VOITURE','MOTO','CAMIONNETTE') NOT NULL,
    parking_id BIGINT NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_parking FOREIGN KEY (parking_id) REFERENCES parkings(id),
    CONSTRAINT uq_plan_parking_type_duree UNIQUE (parking_id, type_vehicule, duree)
) ENGINE=InnoDB;

-- =====================================================================
-- 5. CLIENTS (base, inheritance JOINED)
-- =====================================================================
CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('PARTICULIER','ENTREPRISE') NOT NULL,
    email VARCHAR(150) NULL,
    telephone VARCHAR(30) NULL,
    adresse VARCHAR(255) NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 6. CLIENTS_PARTICULIER
-- =====================================================================
CREATE TABLE clients_particulier (
    id BIGINT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    cin VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT fk_client_particulier FOREIGN KEY (id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 7. CLIENTS_ENTREPRISE
-- =====================================================================
CREATE TABLE clients_entreprise (
    id BIGINT PRIMARY KEY,
    raison_sociale VARCHAR(200) NOT NULL,
    ice VARCHAR(30) NOT NULL UNIQUE,
    rc VARCHAR(30) NULL,
    adresse_siege VARCHAR(255) NULL,
    nom_contact VARCHAR(150) NULL,
    tel_contact VARCHAR(30) NULL,
    email_contact VARCHAR(150) NULL,
    CONSTRAINT fk_client_entreprise FOREIGN KEY (id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 8. VEHICULES
-- =====================================================================
CREATE TABLE vehicules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    immatriculation VARCHAR(30) NOT NULL UNIQUE,
    marque VARCHAR(100) NULL,
    modele VARCHAR(100) NULL,
    couleur VARCHAR(50) NULL,
    type_vehicule ENUM('VOITURE','MOTO','CAMIONNETTE') NOT NULL,
    client_id BIGINT NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    date_ajout DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicule_client FOREIGN KEY (client_id) REFERENCES clients(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 9. CONTRATS (corporate)
-- =====================================================================
CREATE TABLE contrats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    duree_annees INT NOT NULL,
    montant_negocie DECIMAL(12,2) NOT NULL,
    nbr_vehicules_max INT NOT NULL,
    statut ENUM('ACTIF','EXPIRE','RESILIE') NOT NULL DEFAULT 'ACTIF',
    client_entreprise_id BIGINT NOT NULL,
    signe_par BIGINT NULL,
    date_signature DATETIME NULL,
    version BIGINT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contrat_client FOREIGN KEY (client_entreprise_id) REFERENCES clients_entreprise(id),
    CONSTRAINT fk_contrat_signataire FOREIGN KEY (signe_par) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 10. DEMANDES
-- =====================================================================
CREATE TABLE demandes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    type_demande ENUM('NOUVEL_ABONNEMENT','RENOUVELLEMENT') NOT NULL,
    statut ENUM('SOUMISE','EN_COURS','VALIDEE','REJETEE','CORRIGEE','COMPLETEE') NOT NULL DEFAULT 'SOUMISE',
    client_id BIGINT NOT NULL,
    parking_id BIGINT NOT NULL,
    plan_tarifaire_id BIGINT NULL,
    agent_id BIGINT NULL,
    abonnement_concerne_id BIGINT NULL,
    raison_rejet VARCHAR(500) NULL,
    commentaire_correction VARCHAR(500) NULL,
    version BIGINT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_derniere_modif DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_demande_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_demande_parking FOREIGN KEY (parking_id) REFERENCES parkings(id),
    CONSTRAINT fk_demande_plan FOREIGN KEY (plan_tarifaire_id) REFERENCES plans_tarifaires(id),
    CONSTRAINT fk_demande_agent FOREIGN KEY (agent_id) REFERENCES utilisateurs(id)
    -- fk_demande_abonnement_concerne added later (after abonnements table exists)
) ENGINE=InnoDB;

-- =====================================================================
-- 11. DEMANDE_VEHICULES (junction)
-- =====================================================================
CREATE TABLE demande_vehicules (
    demande_id BIGINT NOT NULL,
    vehicule_id BIGINT NOT NULL,
    PRIMARY KEY (demande_id, vehicule_id),
    CONSTRAINT fk_dv_demande FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
    CONSTRAINT fk_dv_vehicule FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 12. ABONNEMENTS (base)
-- =====================================================================
CREATE TABLE abonnements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('REGULIER','ENTREPRISE') NOT NULL,
    statut ENUM('EN_ATTENTE','ACTIF','SUSPENDU','EXPIRE','RESILIE') NOT NULL DEFAULT 'EN_ATTENTE',
    client_id BIGINT NOT NULL,
    parking_id BIGINT NOT NULL,
    demande_id BIGINT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_derniere_modif DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_abonnement_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_abonnement_parking FOREIGN KEY (parking_id) REFERENCES parkings(id),
    CONSTRAINT fk_abonnement_demande FOREIGN KEY (demande_id) REFERENCES demandes(id)
) ENGINE=InnoDB;

-- now that abonnements exists, add the deferred FK from demandes
ALTER TABLE demandes
    ADD CONSTRAINT fk_demande_abonnement_concerne FOREIGN KEY (abonnement_concerne_id) REFERENCES abonnements(id);

-- =====================================================================
-- 13. ABONNEMENTS_REGULIER
-- =====================================================================
CREATE TABLE abonnements_regulier (
    id BIGINT PRIMARY KEY,
    vehicule_id BIGINT NOT NULL,
    plan_tarifaire_id BIGINT NOT NULL,
    CONSTRAINT fk_abo_regulier_base FOREIGN KEY (id) REFERENCES abonnements(id) ON DELETE CASCADE,
    CONSTRAINT fk_abo_regulier_vehicule FOREIGN KEY (vehicule_id) REFERENCES vehicules(id),
    CONSTRAINT fk_abo_regulier_plan FOREIGN KEY (plan_tarifaire_id) REFERENCES plans_tarifaires(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 14. ABONNEMENTS_ENTREPRISE
-- =====================================================================
CREATE TABLE abonnements_entreprise (
    id BIGINT PRIMARY KEY,
    contrat_id BIGINT NOT NULL,
    CONSTRAINT fk_abo_entreprise_base FOREIGN KEY (id) REFERENCES abonnements(id) ON DELETE CASCADE,
    CONSTRAINT fk_abo_entreprise_contrat FOREIGN KEY (contrat_id) REFERENCES contrats(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 15. ABONNEMENT_ENTREPRISE_VEHICULES (junction)
-- =====================================================================
CREATE TABLE abonnement_entreprise_vehicules (
    abonnement_id BIGINT NOT NULL,
    vehicule_id BIGINT NOT NULL,
    date_ajout DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_retrait DATETIME NULL,
    PRIMARY KEY (abonnement_id, vehicule_id),
    CONSTRAINT fk_aev_abonnement FOREIGN KEY (abonnement_id) REFERENCES abonnements_entreprise(id) ON DELETE CASCADE,
    CONSTRAINT fk_aev_vehicule FOREIGN KEY (vehicule_id) REFERENCES vehicules(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 16. PERIODES_ABONNEMENT
-- =====================================================================
CREATE TABLE periodes_abonnement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    montant_total DECIMAL(12,2) NOT NULL,
    statut ENUM('ACTIVE','EXPIREE','RESILIEE') NOT NULL DEFAULT 'ACTIVE',
    abonnement_id BIGINT NOT NULL,
    cree_par BIGINT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_periode_abonnement FOREIGN KEY (abonnement_id) REFERENCES abonnements(id),
    CONSTRAINT fk_periode_createur FOREIGN KEY (cree_par) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 17. PAIEMENTS
-- =====================================================================
CREATE TABLE paiements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    montant DECIMAL(12,2) NOT NULL,
    mode_paiement ENUM('ESPECES','CHEQUE','VIREMENT','CARTE') NOT NULL,
    statut ENUM('EN_ATTENTE','CONFIRME','ANNULE') NOT NULL DEFAULT 'EN_ATTENTE',
    date_paiement DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    numero_cheque VARCHAR(50) NULL,
    banque VARCHAR(100) NULL,
    reference_virement VARCHAR(100) NULL,
    periode_id BIGINT NOT NULL UNIQUE,
    enregistre_par BIGINT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_paiement_periode FOREIGN KEY (periode_id) REFERENCES periodes_abonnement(id),
    CONSTRAINT fk_paiement_agent FOREIGN KEY (enregistre_par) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 18. FACTURES
-- =====================================================================
CREATE TABLE factures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    date_emission DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant_ht DECIMAL(12,2) NOT NULL,
    taux_tva DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    montant_tva DECIMAL(12,2) NOT NULL,
    montant_ttc DECIMAL(12,2) NOT NULL,
    statut ENUM('BROUILLON','EMISE','SIGNEE','ANNULEE') NOT NULL DEFAULT 'BROUILLON',
    periode_id BIGINT NOT NULL UNIQUE,
    genere_par BIGINT NULL,
    signee_par BIGINT NULL,
    date_signature DATETIME NULL,
    chemin_pdf VARCHAR(500) NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_facture_periode FOREIGN KEY (periode_id) REFERENCES periodes_abonnement(id),
    CONSTRAINT fk_facture_generateur FOREIGN KEY (genere_par) REFERENCES utilisateurs(id),
    CONSTRAINT fk_facture_signataire FOREIGN KEY (signee_par) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 19. LIGNES_FACTURE
-- =====================================================================
CREATE TABLE lignes_facture (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    montant_total DECIMAL(12,2) NOT NULL,
    facture_id BIGINT NOT NULL,
    CONSTRAINT fk_ligne_facture FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 20. RECUS
-- =====================================================================
CREATE TABLE recus (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    date_emission DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant DECIMAL(12,2) NOT NULL,
    paiement_id BIGINT NOT NULL UNIQUE,
    emis_par BIGINT NULL,
    chemin_pdf VARCHAR(500) NULL,
    CONSTRAINT fk_recu_paiement FOREIGN KEY (paiement_id) REFERENCES paiements(id),
    CONSTRAINT fk_recu_emetteur FOREIGN KEY (emis_par) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 21. RECETTES
-- =====================================================================
CREATE TABLE recettes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    date_generation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(12,2) NOT NULL,
    nombre_paiements INT NOT NULL DEFAULT 0,
    parking_id BIGINT NULL,
    genere_par BIGINT NULL,
    chemin_pdf VARCHAR(500) NULL,
    CONSTRAINT fk_recette_parking FOREIGN KEY (parking_id) REFERENCES parkings(id),
    CONSTRAINT fk_recette_generateur FOREIGN KEY (genere_par) REFERENCES utilisateurs(id),
    CONSTRAINT uq_recette_periode_parking UNIQUE (date_debut, date_fin, parking_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 22. RECETTE_PAIEMENTS (junction)
-- =====================================================================
CREATE TABLE recette_paiements (
    recette_id BIGINT NOT NULL,
    paiement_id BIGINT NOT NULL,
    PRIMARY KEY (recette_id, paiement_id),
    CONSTRAINT fk_rp_recette FOREIGN KEY (recette_id) REFERENCES recettes(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_paiement FOREIGN KEY (paiement_id) REFERENCES paiements(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 23. CARTES_ACCES
-- =====================================================================
CREATE TABLE cartes_acces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_carte VARCHAR(50) NOT NULL UNIQUE,
    statut ENUM('A_PREPARER','A_ACTIVER','ACTIVE','EXPIREE','DESACTIVEE') NOT NULL DEFAULT 'A_PREPARER',
    date_preparation DATETIME NULL,
    date_activation DATETIME NULL,
    date_desactivation DATETIME NULL,
    note_activation VARCHAR(500) NULL,
    abonnement_id BIGINT NOT NULL UNIQUE,
    prepare_par BIGINT NULL,
    active_par BIGINT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_carte_abonnement FOREIGN KEY (abonnement_id) REFERENCES abonnements(id),
    CONSTRAINT fk_carte_preparateur FOREIGN KEY (prepare_par) REFERENCES utilisateurs(id),
    CONSTRAINT fk_carte_activateur FOREIGN KEY (active_par) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 24. NOTIFICATIONS
-- =====================================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('EMAIL','WHATSAPP','SYSTEME') NOT NULL,
    categorie ENUM('CONFIRMATION','RAPPEL_EXPIRATION','EXPIRATION','REJET','VALIDATION') NOT NULL,
    sujet VARCHAR(200) NULL,
    message TEXT NOT NULL,
    statut ENUM('EN_ATTENTE','ENVOYEE','ECHOUEE') NOT NULL DEFAULT 'EN_ATTENTE',
    tentatives INT NOT NULL DEFAULT 0,
    date_envoi DATETIME NULL,
    client_id BIGINT NULL,
    abonnement_id BIGINT NULL,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_notif_abonnement FOREIGN KEY (abonnement_id) REFERENCES abonnements(id)
) ENGINE=InnoDB;

-- =====================================================================
-- 25. AUDIT_LOGS
-- =====================================================================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action ENUM('CREATE','UPDATE','DELETE','VALIDATE','REJECT','SIGN','ACTIVATE',
                'SUSPEND','RESILIE','LOGIN','LOGOUT','GENERATE_DOC','CORRECT') NOT NULL,
    entite VARCHAR(100) NOT NULL,
    entite_id BIGINT NOT NULL,
    ancienne_valeur JSON NULL,
    nouvelle_valeur JSON NULL,
    utilisateur_id BIGINT NULL,
    date_action DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_adresse VARCHAR(50) NULL,
    user_agent VARCHAR(255) NULL,
    CONSTRAINT fk_audit_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
) ENGINE=InnoDB;

-- =====================================================================
-- INDEXES for common filter/search patterns
-- =====================================================================
CREATE INDEX idx_demandes_statut ON demandes(statut);
CREATE INDEX idx_demandes_parking ON demandes(parking_id);
CREATE INDEX idx_abonnements_statut ON abonnements(statut);
CREATE INDEX idx_abonnements_parking ON abonnements(parking_id);
CREATE INDEX idx_paiements_statut ON paiements(statut);
CREATE INDEX idx_factures_statut ON factures(statut);
CREATE INDEX idx_cartes_statut ON cartes_acces(statut);
CREATE INDEX idx_audit_entite ON audit_logs(entite, entite_id);
CREATE INDEX idx_audit_date ON audit_logs(date_action);
