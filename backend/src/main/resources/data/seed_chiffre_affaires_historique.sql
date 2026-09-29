-- ==============================================================================
-- Script de Seed : Données Historiques de Chiffre d'Affaires (12 Mois Réalistes)
-- ==============================================================================
-- Ce script enrichit la base rrm_db pour afficher un tableau de bord financier
-- complet, visuel et dynamique sur l'ensemble des 12 derniers mois (Octobre 2025 à Septembre 2026).
--
-- Il alimente :
-- 1. Les 6 Parkings majeurs de Rabat (Badr, Bab El Had, Théâtre Med V, Chellah, Rabia, Russie)
-- 2. Le mix Particuliers (Abonnements réguliers) et Entreprises (Contrats Corporate)
-- 3. Une courbe d'évolution progressive et réaliste de 68 000 DH HT à 118 500 DH HT / mois
-- ==============================================================================

USE rrm_db;

-- ------------------------------------------------------------------------------
-- 1. Nettoyage préventif des données historiques de test (si réexécution)
-- ------------------------------------------------------------------------------
DELETE FROM periode_abonnement WHERE abonnement_id IN (
    SELECT id FROM abonnement WHERE reference LIKE 'ABO-HIST-%'
);
DELETE FROM affectation_parking WHERE abonnement_regulier_id IN (
    SELECT id FROM abonnement WHERE reference LIKE 'ABO-HIST-%'
);
DELETE FROM abonnement_regulier WHERE id IN (
    SELECT id FROM abonnement WHERE reference LIKE 'ABO-HIST-%'
);
DELETE FROM abonnement_entreprise WHERE id IN (
    SELECT id FROM abonnement WHERE reference LIKE 'ABO-HIST-%'
);
DELETE FROM demande_nouveau_contrat_corporate WHERE id IN (
    SELECT id FROM demande_client WHERE reference LIKE 'DEM-CORP-HIST-%'
);
DELETE FROM demande_client WHERE reference LIKE 'DEM-CORP-HIST-%';
DELETE FROM contrat_corporate WHERE reference LIKE 'CONTRAT-HIST-%';
DELETE FROM abonnement WHERE reference LIKE 'ABO-HIST-%';
DELETE FROM client_particulier WHERE id IN (
    SELECT id FROM client WHERE email LIKE 'ca.hist.%@rrm.ma'
);
DELETE FROM client_entreprise WHERE id IN (
    SELECT id FROM client WHERE email LIKE 'corp.hist.%@rrm.ma'
);
DELETE FROM client WHERE email LIKE 'ca.hist.%@rrm.ma' OR email LIKE 'corp.hist.%@rrm.ma';

-- ------------------------------------------------------------------------------
-- 2. Clients Particuliers & Abonnements Réguliers (1 par Parking)
-- ------------------------------------------------------------------------------

-- Parking Badr (Client: Karim Benjelloun)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('ca.hist.badr@rrm.ma', '0661000101', 'ACTIF', '2025-09-15 10:00:00', NOW());
SET @cl_badr := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin) VALUES (@cl_badr, 'Benjelloun', 'Karim', 'A990011');
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-REG-BADR', 'ACTIF', '2025-09-20 10:00:00', NOW());
SET @abo_badr := LAST_INSERT_ID();
INSERT INTO abonnement_regulier (id, client_particulier_id) VALUES (@abo_badr, @cl_badr);
INSERT INTO affectation_parking (abonnement_regulier_id, parking_id, date_debut, date_fin, date_creation)
VALUES (@abo_badr, COALESCE((SELECT id FROM parking WHERE code = 'BADR' OR nom LIKE '%Badr%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), '2025-10-01', '2026-12-31', NOW());

-- Parking Bab El Had (Client: Mouna Berrada)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('ca.hist.had@rrm.ma', '0661000102', 'ACTIF', '2025-09-15 10:00:00', NOW());
SET @cl_had := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin) VALUES (@cl_had, 'Berrada', 'Mouna', 'B990022');
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-REG-HAD', 'ACTIF', '2025-09-20 10:00:00', NOW());
SET @abo_had := LAST_INSERT_ID();
INSERT INTO abonnement_regulier (id, client_particulier_id) VALUES (@abo_had, @cl_had);
INSERT INTO affectation_parking (abonnement_regulier_id, parking_id, date_debut, date_fin, date_creation)
VALUES (@abo_had, COALESCE((SELECT id FROM parking WHERE code = 'BAB_EL_HAD' OR nom LIKE '%Bab El Had%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), '2025-10-01', '2026-12-31', NOW());

-- Parking Théâtre Mohammed V (Client: Reda Tazi)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('ca.hist.theatre@rrm.ma', '0661000103', 'ACTIF', '2025-09-15 10:00:00', NOW());
SET @cl_theatre := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin) VALUES (@cl_theatre, 'Tazi', 'Reda', 'C990033');
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-REG-THEA', 'ACTIF', '2025-09-20 10:00:00', NOW());
SET @abo_theatre := LAST_INSERT_ID();
INSERT INTO abonnement_regulier (id, client_particulier_id) VALUES (@abo_theatre, @cl_theatre);
INSERT INTO affectation_parking (abonnement_regulier_id, parking_id, date_debut, date_fin, date_creation)
VALUES (@abo_theatre, COALESCE((SELECT id FROM parking WHERE code = 'THEATRE_MOHAMMED_V' OR nom LIKE '%Théâtre%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), '2025-10-01', '2026-12-31', NOW());

-- Parking Bab Chellah (Client: Zineb Chraibi)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('ca.hist.chellah@rrm.ma', '0661000104', 'ACTIF', '2025-09-15 10:00:00', NOW());
SET @cl_chellah := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin) VALUES (@cl_chellah, 'Chraibi', 'Zineb', 'D990044');
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-REG-CHEL', 'ACTIF', '2025-09-20 10:00:00', NOW());
SET @abo_chellah := LAST_INSERT_ID();
INSERT INTO abonnement_regulier (id, client_particulier_id) VALUES (@abo_chellah, @cl_chellah);
INSERT INTO affectation_parking (abonnement_regulier_id, parking_id, date_debut, date_fin, date_creation)
VALUES (@abo_chellah, COALESCE((SELECT id FROM parking WHERE code IN ('BAB_CHELLAH', 'PARKING_CHELLAH') OR nom LIKE '%Chellah%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), '2025-10-01', '2026-12-31', NOW());

-- Parking Rabia Al Adaouia (Client: Mehdi El Idrissi)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('ca.hist.rabia@rrm.ma', '0661000105', 'ACTIF', '2025-09-15 10:00:00', NOW());
SET @cl_rabia := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin) VALUES (@cl_rabia, 'El Idrissi', 'Mehdi', 'E990055');
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-REG-RAB', 'ACTIF', '2025-09-20 10:00:00', NOW());
SET @abo_rabia := LAST_INSERT_ID();
INSERT INTO abonnement_regulier (id, client_particulier_id) VALUES (@abo_rabia, @cl_rabia);
INSERT INTO affectation_parking (abonnement_regulier_id, parking_id, date_debut, date_fin, date_creation)
VALUES (@abo_rabia, COALESCE((SELECT id FROM parking WHERE code = 'RABIA_AL_ADAOUIA' OR nom LIKE '%Rabia%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), '2025-10-01', '2026-12-31', NOW());

-- Parking Place de Russie (Client: Leila Alami)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('ca.hist.russie@rrm.ma', '0661000106', 'ACTIF', '2025-09-15 10:00:00', NOW());
SET @cl_russie := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin) VALUES (@cl_russie, 'Alami', 'Leila', 'F990066');
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-REG-RUS', 'ACTIF', '2025-09-20 10:00:00', NOW());
SET @abo_russie := LAST_INSERT_ID();
INSERT INTO abonnement_regulier (id, client_particulier_id) VALUES (@abo_russie, @cl_russie);
INSERT INTO affectation_parking (abonnement_regulier_id, parking_id, date_debut, date_fin, date_creation)
VALUES (@abo_russie, COALESCE((SELECT id FROM parking WHERE code = 'PLACE_RUSSIE' OR nom LIKE '%Russie%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), '2025-10-01', '2026-12-31', NOW());


-- ------------------------------------------------------------------------------
-- 3. Clients Entreprises & Contrats Corporate
-- ------------------------------------------------------------------------------

-- Entreprise 1 : Maroc Telecom (IAM) - Parking Badr Agdal (25 places)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('corp.hist.iam@rrm.ma', '0537719000', 'ACTIF', '2025-09-10 09:00:00', NOW());
SET @cl_corp_iam := LAST_INSERT_ID();
INSERT INTO client_entreprise (id, raison_sociale, ice, numerorc, adresse_siege, nom_contact_principal)
VALUES (@cl_corp_iam, 'Maroc Telecom SA', '001524310000088', 'RC-99881', 'Avenue Annakhil, Hay Riad, Rabat', 'Directeur Logistique IAM');
INSERT INTO contrat_corporate (reference, statut, nombre_places_contractuelles, client_entreprise_id, date_debut, date_fin, date_creation, date_modification)
VALUES ('CONTRAT-HIST-IAM', 'ACTIF', 25, @cl_corp_iam, '2025-10-01', '2026-12-31', NOW(), NOW());
SET @contrat_iam := LAST_INSERT_ID();
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification)
VALUES ('DEM-CORP-HIST-IAM', 'FINALISEE', 'EN_LIGNE', @cl_corp_iam, '2025-09-12 10:00:00', '2025-09-12 11:00:00', NOW());
SET @dem_corp_iam := LAST_INSERT_ID();
INSERT INTO demande_nouveau_contrat_corporate (id, contrat_genere_id, parking_id, titre_foncier, libelle_projet, adresse_projet, nombre_places, prix_mensuel_unitaire_ttc, montant_abonnement_ttc, frais_cartes_ttc, montant_total_ttc)
VALUES (@dem_corp_iam, @contrat_iam, COALESCE((SELECT id FROM parking WHERE code = 'BADR' OR nom LIKE '%Badr%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), 'TF-IAM-01', 'Flotte Maroc Telecom Agdal', 'Avenue Fal Ould Oumeir, Agdal', 25, 450.00, 135000.00, 1250.00, 136250.00);
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-CORP-IAM', 'ACTIF', '2025-09-25 10:00:00', NOW());
SET @abo_corp_iam := LAST_INSERT_ID();
INSERT INTO abonnement_entreprise (id, contrat_corporate_id) VALUES (@abo_corp_iam, @contrat_iam);

-- Entreprise 2 : CDG Développement - Parking Théâtre Mohammed V (20 places)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('corp.hist.cdg@rrm.ma', '0537669000', 'ACTIF', '2025-09-10 09:00:00', NOW());
SET @cl_corp_cdg := LAST_INSERT_ID();
INSERT INTO client_entreprise (id, raison_sociale, ice, numerorc, adresse_siege, nom_contact_principal)
VALUES (@cl_corp_cdg, 'CDG Développement', '001524310000089', 'RC-99882', 'Place Moulay El Hassan, Rabat', 'Responsable Flotte CDG');
INSERT INTO contrat_corporate (reference, statut, nombre_places_contractuelles, client_entreprise_id, date_debut, date_fin, date_creation, date_modification)
VALUES ('CONTRAT-HIST-CDG', 'ACTIF', 20, @cl_corp_cdg, '2025-10-01', '2026-12-31', NOW(), NOW());
SET @contrat_cdg := LAST_INSERT_ID();
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification)
VALUES ('DEM-CORP-HIST-CDG', 'FINALISEE', 'EN_LIGNE', @cl_corp_cdg, '2025-09-12 10:00:00', '2025-09-12 11:00:00', NOW());
SET @dem_corp_cdg := LAST_INSERT_ID();
INSERT INTO demande_nouveau_contrat_corporate (id, contrat_genere_id, parking_id, titre_foncier, libelle_projet, adresse_projet, nombre_places, prix_mensuel_unitaire_ttc, montant_abonnement_ttc, frais_cartes_ttc, montant_total_ttc)
VALUES (@dem_corp_cdg, @contrat_cdg, COALESCE((SELECT id FROM parking WHERE code = 'THEATRE_MOHAMMED_V' OR nom LIKE '%Théâtre%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), 'TF-CDG-02', 'Parc Véhicules Cadres CDG', 'Avenue Moulay Rachid, Rabat', 20, 500.00, 120000.00, 1000.00, 121000.00);
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-CORP-CDG', 'ACTIF', '2025-09-25 10:00:00', NOW());
SET @abo_corp_cdg := LAST_INSERT_ID();
INSERT INTO abonnement_entreprise (id, contrat_corporate_id) VALUES (@abo_corp_cdg, @contrat_cdg);

-- Entreprise 3 : Attijariwafa Bank - Parking Bab El Had (15 places)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('corp.hist.attijari@rrm.ma', '0537209000', 'ACTIF', '2025-09-10 09:00:00', NOW());
SET @cl_corp_attijari := LAST_INSERT_ID();
INSERT INTO client_entreprise (id, raison_sociale, ice, numerorc, adresse_siege, nom_contact_principal)
VALUES (@cl_corp_attijari, 'Attijariwafa Bank Région Rabat', '001524310000090', 'RC-99883', 'Avenue Hassan II, Rabat', 'Chef Logistique AWB');
INSERT INTO contrat_corporate (reference, statut, nombre_places_contractuelles, client_entreprise_id, date_debut, date_fin, date_creation, date_modification)
VALUES ('CONTRAT-HIST-AWB', 'ACTIF', 15, @cl_corp_attijari, '2025-10-01', '2026-12-31', NOW(), NOW());
SET @contrat_attijari := LAST_INSERT_ID();
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification)
VALUES ('DEM-CORP-HIST-AWB', 'FINALISEE', 'EN_LIGNE', @cl_corp_attijari, '2025-09-12 10:00:00', '2025-09-12 11:00:00', NOW());
SET @dem_corp_attijari := LAST_INSERT_ID();
INSERT INTO demande_nouveau_contrat_corporate (id, contrat_genere_id, parking_id, titre_foncier, libelle_projet, adresse_projet, nombre_places, prix_mensuel_unitaire_ttc, montant_abonnement_ttc, frais_cartes_ttc, montant_total_ttc)
VALUES (@dem_corp_attijari, @contrat_attijari, COALESCE((SELECT id FROM parking WHERE code = 'BAB_EL_HAD' OR nom LIKE '%Bab El Had%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), 'TF-AWB-03', 'Flotte Agences Bab El Had', 'Place Bab El Had, Rabat', 15, 450.00, 81000.00, 750.00, 81750.00);
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-CORP-AWB', 'ACTIF', '2025-09-25 10:00:00', NOW());
SET @abo_corp_attijari := LAST_INSERT_ID();
INSERT INTO abonnement_entreprise (id, contrat_corporate_id) VALUES (@abo_corp_attijari, @contrat_attijari);

-- Entreprise 4 : ONCF Siège - Parking Rabia Al Adaouia (12 places)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('corp.hist.oncf@rrm.ma', '0537779000', 'ACTIF', '2025-09-10 09:00:00', NOW());
SET @cl_corp_oncf := LAST_INSERT_ID();
INSERT INTO client_entreprise (id, raison_sociale, ice, numerorc, adresse_siege, nom_contact_principal)
VALUES (@cl_corp_oncf, 'Office National des Chemins de Fer', '001524310000091', 'RC-99884', 'Rue Abderrahmane El Ghafiki, Agdal', 'Gestionnaire Parc ONCF');
INSERT INTO contrat_corporate (reference, statut, nombre_places_contractuelles, client_entreprise_id, date_debut, date_fin, date_creation, date_modification)
VALUES ('CONTRAT-HIST-ONCF', 'ACTIF', 12, @cl_corp_oncf, '2025-10-01', '2026-12-31', NOW(), NOW());
SET @contrat_oncf := LAST_INSERT_ID();
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification)
VALUES ('DEM-CORP-HIST-ONCF', 'FINALISEE', 'EN_LIGNE', @cl_corp_oncf, '2025-09-12 10:00:00', '2025-09-12 11:00:00', NOW());
SET @dem_corp_oncf := LAST_INSERT_ID();
INSERT INTO demande_nouveau_contrat_corporate (id, contrat_genere_id, parking_id, titre_foncier, libelle_projet, adresse_projet, nombre_places, prix_mensuel_unitaire_ttc, montant_abonnement_ttc, frais_cartes_ttc, montant_total_ttc)
VALUES (@dem_corp_oncf, @contrat_oncf, COALESCE((SELECT id FROM parking WHERE code = 'RABIA_AL_ADAOUIA' OR nom LIKE '%Rabia%' LIMIT 1), (SELECT id FROM parking ORDER BY id ASC LIMIT 1)), 'TF-ONCF-04', 'Projet Navette ONCF Rabia', 'Avenue Allal Ben Abdellah', 12, 420.00, 60480.00, 600.00, 61080.00);
INSERT INTO abonnement (reference, statut, date_creation, date_modification)
VALUES ('ABO-HIST-CORP-ONCF', 'ACTIF', '2025-09-25 10:00:00', NOW());
SET @abo_corp_oncf := LAST_INSERT_ID();
INSERT INTO abonnement_entreprise (id, contrat_corporate_id) VALUES (@abo_corp_oncf, @contrat_oncf);


-- ------------------------------------------------------------------------------
-- 4. Résolution garantie des Abonnements pour l'insertion des périodes
-- ------------------------------------------------------------------------------
SET @abo_badr          := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-REG-BADR' LIMIT 1);
SET @abo_had           := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-REG-HAD' LIMIT 1);
SET @abo_theatre       := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-REG-THEA' LIMIT 1);
SET @abo_chellah       := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-REG-CHEL' LIMIT 1);
SET @abo_rabia         := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-REG-RAB' LIMIT 1);
SET @abo_russie        := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-REG-RUS' LIMIT 1);
SET @abo_corp_iam      := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-CORP-IAM' LIMIT 1);
SET @abo_corp_cdg      := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-CORP-CDG' LIMIT 1);
SET @abo_corp_attijari := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-CORP-AWB' LIMIT 1);
SET @abo_corp_oncf     := (SELECT id FROM abonnement WHERE reference = 'ABO-HIST-CORP-ONCF' LIMIT 1);

-- ------------------------------------------------------------------------------
-- 5. Périodes d'Abonnement Mensuelles sur 12 Mois (Oct 2025 -> Sep 2026)
-- ------------------------------------------------------------------------------

-- == MOIS 1 : OCTOBRE 2025 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          1, '2025-10-01', '2025-10-31', 'ACTIVE',  8500.00, 20.00, NOW()),
(@abo_had,           1, '2025-10-01', '2025-10-31', 'ACTIVE',  7200.00, 20.00, NOW()),
(@abo_theatre,       1, '2025-10-01', '2025-10-31', 'ACTIVE',  6500.00, 20.00, NOW()),
(@abo_chellah,       1, '2025-10-01', '2025-10-31', 'ACTIVE',  5200.00, 20.00, NOW()),
(@abo_rabia,         1, '2025-10-01', '2025-10-31', 'ACTIVE',  4100.00, 20.00, NOW()),
(@abo_russie,        1, '2025-10-01', '2025-10-31', 'ACTIVE',  2800.00, 20.00, NOW()),
(@abo_corp_iam,      1, '2025-10-01', '2025-10-31', 'ACTIVE', 14000.00, 20.00, NOW()),
(@abo_corp_cdg,      1, '2025-10-01', '2025-10-31', 'ACTIVE', 10500.00, 20.00, NOW()),
(@abo_corp_attijari, 1, '2025-10-01', '2025-10-31', 'ACTIVE',  5500.00, 20.00, NOW()),
(@abo_corp_oncf,     1, '2025-10-01', '2025-10-31', 'ACTIVE',  3800.00, 20.00, NOW());

-- == MOIS 2 : NOVEMBRE 2025 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          2, '2025-11-01', '2025-11-30', 'ACTIVE',  9000.00, 20.00, NOW()),
(@abo_had,           2, '2025-11-01', '2025-11-30', 'ACTIVE',  7600.00, 20.00, NOW()),
(@abo_theatre,       2, '2025-11-01', '2025-11-30', 'ACTIVE',  6800.00, 20.00, NOW()),
(@abo_chellah,       2, '2025-11-01', '2025-11-30', 'ACTIVE',  5500.00, 20.00, NOW()),
(@abo_rabia,         2, '2025-11-01', '2025-11-30', 'ACTIVE',  4300.00, 20.00, NOW()),
(@abo_russie,        2, '2025-11-01', '2025-11-30', 'ACTIVE',  3000.00, 20.00, NOW()),
(@abo_corp_iam,      2, '2025-11-01', '2025-11-30', 'ACTIVE', 14200.00, 20.00, NOW()),
(@abo_corp_cdg,      2, '2025-11-01', '2025-11-30', 'ACTIVE', 10800.00, 20.00, NOW()),
(@abo_corp_attijari, 2, '2025-11-01', '2025-11-30', 'ACTIVE',  5700.00, 20.00, NOW()),
(@abo_corp_oncf,     2, '2025-11-01', '2025-11-30', 'ACTIVE',  4000.00, 20.00, NOW());

-- == MOIS 3 : DECEMBRE 2025 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          3, '2025-12-01', '2025-12-31', 'ACTIVE',  9500.00, 20.00, NOW()),
(@abo_had,           3, '2025-12-01', '2025-12-31', 'ACTIVE',  8100.00, 20.00, NOW()),
(@abo_theatre,       3, '2025-12-01', '2025-12-31', 'ACTIVE',  7200.00, 20.00, NOW()),
(@abo_chellah,       3, '2025-12-01', '2025-12-31', 'ACTIVE',  5900.00, 20.00, NOW()),
(@abo_rabia,         3, '2025-12-01', '2025-12-31', 'ACTIVE',  4500.00, 20.00, NOW()),
(@abo_russie,        3, '2025-12-01', '2025-12-31', 'ACTIVE',  3200.00, 20.00, NOW()),
(@abo_corp_iam,      3, '2025-12-01', '2025-12-31', 'ACTIVE', 14500.00, 20.00, NOW()),
(@abo_corp_cdg,      3, '2025-12-01', '2025-12-31', 'ACTIVE', 11000.00, 20.00, NOW()),
(@abo_corp_attijari, 3, '2025-12-01', '2025-12-31', 'ACTIVE',  6000.00, 20.00, NOW()),
(@abo_corp_oncf,     3, '2025-12-01', '2025-12-31', 'ACTIVE',  4200.00, 20.00, NOW());

-- == MOIS 4 : JANVIER 2026 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          4, '2026-01-01', '2026-01-31', 'ACTIVE', 10500.00, 20.00, NOW()),
(@abo_had,           4, '2026-01-01', '2026-01-31', 'ACTIVE',  8800.00, 20.00, NOW()),
(@abo_theatre,       4, '2026-01-01', '2026-01-31', 'ACTIVE',  7800.00, 20.00, NOW()),
(@abo_chellah,       4, '2026-01-01', '2026-01-31', 'ACTIVE',  6400.00, 20.00, NOW()),
(@abo_rabia,         4, '2026-01-01', '2026-01-31', 'ACTIVE',  4900.00, 20.00, NOW()),
(@abo_russie,        4, '2026-01-01', '2026-01-31', 'ACTIVE',  3500.00, 20.00, NOW()),
(@abo_corp_iam,      4, '2026-01-01', '2026-01-31', 'ACTIVE', 15000.00, 20.00, NOW()),
(@abo_corp_cdg,      4, '2026-01-01', '2026-01-31', 'ACTIVE', 11500.00, 20.00, NOW()),
(@abo_corp_attijari, 4, '2026-01-01', '2026-01-31', 'ACTIVE',  6400.00, 20.00, NOW()),
(@abo_corp_oncf,     4, '2026-01-01', '2026-01-31', 'ACTIVE',  4400.00, 20.00, NOW());

-- == MOIS 5 : FEVRIER 2026 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          5, '2026-02-01', '2026-02-28', 'ACTIVE', 11000.00, 20.00, NOW()),
(@abo_had,           5, '2026-02-01', '2026-02-28', 'ACTIVE',  9200.00, 20.00, NOW()),
(@abo_theatre,       5, '2026-02-01', '2026-02-28', 'ACTIVE',  8200.00, 20.00, NOW()),
(@abo_chellah,       5, '2026-02-01', '2026-02-28', 'ACTIVE',  6700.00, 20.00, NOW()),
(@abo_rabia,         5, '2026-02-01', '2026-02-28', 'ACTIVE',  5100.00, 20.00, NOW()),
(@abo_russie,        5, '2026-02-01', '2026-02-28', 'ACTIVE',  3700.00, 20.00, NOW()),
(@abo_corp_iam,      5, '2026-02-01', '2026-02-28', 'ACTIVE', 15200.00, 20.00, NOW()),
(@abo_corp_cdg,      5, '2026-02-01', '2026-02-28', 'ACTIVE', 11800.00, 20.00, NOW()),
(@abo_corp_attijari, 5, '2026-02-01', '2026-02-28', 'ACTIVE',  6600.00, 20.00, NOW()),
(@abo_corp_oncf,     5, '2026-02-01', '2026-02-28', 'ACTIVE',  4600.00, 20.00, NOW());

-- == MOIS 6 : MARS 2026 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          6, '2026-03-01', '2026-03-31', 'ACTIVE', 11500.00, 20.00, NOW()),
(@abo_had,           6, '2026-03-01', '2026-03-31', 'ACTIVE',  9700.00, 20.00, NOW()),
(@abo_theatre,       6, '2026-03-01', '2026-03-31', 'ACTIVE',  8600.00, 20.00, NOW()),
(@abo_chellah,       6, '2026-03-01', '2026-03-31', 'ACTIVE',  7000.00, 20.00, NOW()),
(@abo_rabia,         6, '2026-03-01', '2026-03-31', 'ACTIVE',  5400.00, 20.00, NOW()),
(@abo_russie,        6, '2026-03-01', '2026-03-31', 'ACTIVE',  3900.00, 20.00, NOW()),
(@abo_corp_iam,      6, '2026-03-01', '2026-03-31', 'ACTIVE', 15500.00, 20.00, NOW()),
(@abo_corp_cdg,      6, '2026-03-01', '2026-03-31', 'ACTIVE', 12000.00, 20.00, NOW()),
(@abo_corp_attijari, 6, '2026-03-01', '2026-03-31', 'ACTIVE',  6800.00, 20.00, NOW()),
(@abo_corp_oncf,     6, '2026-03-01', '2026-03-31', 'ACTIVE',  4800.00, 20.00, NOW());

-- == MOIS 7 : AVRIL 2026 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          7, '2026-04-01', '2026-04-30', 'ACTIVE', 12100.00, 20.00, NOW()),
(@abo_had,           7, '2026-04-01', '2026-04-30', 'ACTIVE', 10200.00, 20.00, NOW()),
(@abo_theatre,       7, '2026-04-01', '2026-04-30', 'ACTIVE',  9000.00, 20.00, NOW()),
(@abo_chellah,       7, '2026-04-01', '2026-04-30', 'ACTIVE',  7300.00, 20.00, NOW()),
(@abo_rabia,         7, '2026-04-01', '2026-04-30', 'ACTIVE',  5600.00, 20.00, NOW()),
(@abo_russie,        7, '2026-04-01', '2026-04-30', 'ACTIVE',  4100.00, 20.00, NOW()),
(@abo_corp_iam,      7, '2026-04-01', '2026-04-30', 'ACTIVE', 15800.00, 20.00, NOW()),
(@abo_corp_cdg,      7, '2026-04-01', '2026-04-30', 'ACTIVE', 12300.00, 20.00, NOW()),
(@abo_corp_attijari, 7, '2026-04-01', '2026-04-30', 'ACTIVE',  7000.00, 20.00, NOW()),
(@abo_corp_oncf,     7, '2026-04-01', '2026-04-30', 'ACTIVE',  5000.00, 20.00, NOW());

-- == MOIS 8 : MAI 2026 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          8, '2026-05-01', '2026-05-31', 'ACTIVE', 12700.00, 20.00, NOW()),
(@abo_had,           8, '2026-05-01', '2026-05-31', 'ACTIVE', 10800.00, 20.00, NOW()),
(@abo_theatre,       8, '2026-05-01', '2026-05-31', 'ACTIVE',  9500.00, 20.00, NOW()),
(@abo_chellah,       8, '2026-05-01', '2026-05-31', 'ACTIVE',  7700.00, 20.00, NOW()),
(@abo_rabia,         8, '2026-05-01', '2026-05-31', 'ACTIVE',  5900.00, 20.00, NOW()),
(@abo_russie,        8, '2026-05-01', '2026-05-31', 'ACTIVE',  4300.00, 20.00, NOW()),
(@abo_corp_iam,      8, '2026-05-01', '2026-05-31', 'ACTIVE', 16200.00, 20.00, NOW()),
(@abo_corp_cdg,      8, '2026-05-01', '2026-05-31', 'ACTIVE', 12600.00, 20.00, NOW()),
(@abo_corp_attijari, 8, '2026-05-01', '2026-05-31', 'ACTIVE',  7300.00, 20.00, NOW()),
(@abo_corp_oncf,     8, '2026-05-01', '2026-05-31', 'ACTIVE',  5200.00, 20.00, NOW());

-- == MOIS 9 : JUIN 2026 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          9, '2026-06-01', '2026-06-30', 'ACTIVE', 13400.00, 20.00, NOW()),
(@abo_had,           9, '2026-06-01', '2026-06-30', 'ACTIVE', 11400.00, 20.00, NOW()),
(@abo_theatre,       9, '2026-06-01', '2026-06-30', 'ACTIVE', 10000.00, 20.00, NOW()),
(@abo_chellah,       9, '2026-06-01', '2026-06-30', 'ACTIVE',  8100.00, 20.00, NOW()),
(@abo_rabia,         9, '2026-06-01', '2026-06-30', 'ACTIVE',  6200.00, 20.00, NOW()),
(@abo_russie,        9, '2026-06-01', '2026-06-30', 'ACTIVE',  4600.00, 20.00, NOW()),
(@abo_corp_iam,      9, '2026-06-01', '2026-06-30', 'ACTIVE', 16600.00, 20.00, NOW()),
(@abo_corp_cdg,      9, '2026-06-01', '2026-06-30', 'ACTIVE', 13000.00, 20.00, NOW()),
(@abo_corp_attijari, 9, '2026-06-01', '2026-06-30', 'ACTIVE',  7600.00, 20.00, NOW()),
(@abo_corp_oncf,     9, '2026-06-01', '2026-06-30', 'ACTIVE',  5400.00, 20.00, NOW());

-- == MOIS 10 : JUILLET 2026 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          10, '2026-07-01', '2026-07-31', 'ACTIVE', 14000.00, 20.00, NOW()),
(@abo_had,           10, '2026-07-01', '2026-07-31', 'ACTIVE', 11900.00, 20.00, NOW()),
(@abo_theatre,       10, '2026-07-01', '2026-07-31', 'ACTIVE', 10500.00, 20.00, NOW()),
(@abo_chellah,       10, '2026-07-01', '2026-07-31', 'ACTIVE',  8500.00, 20.00, NOW()),
(@abo_rabia,         10, '2026-07-01', '2026-07-31', 'ACTIVE',  6500.00, 20.00, NOW()),
(@abo_russie,        10, '2026-07-01', '2026-07-31', 'ACTIVE',  4800.00, 20.00, NOW()),
(@abo_corp_iam,      10, '2026-07-01', '2026-07-31', 'ACTIVE', 17000.00, 20.00, NOW()),
(@abo_corp_cdg,      10, '2026-07-01', '2026-07-31', 'ACTIVE', 13400.00, 20.00, NOW()),
(@abo_corp_attijari, 10, '2026-07-01', '2026-07-31', 'ACTIVE',  7900.00, 20.00, NOW()),
(@abo_corp_oncf,     10, '2026-07-01', '2026-07-31', 'ACTIVE',  5600.00, 20.00, NOW());

-- == MOIS 11 : AOUT 2026 ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          11, '2026-08-01', '2026-08-31', 'ACTIVE', 14500.00, 20.00, NOW()),
(@abo_had,           11, '2026-08-01', '2026-08-31', 'ACTIVE', 12300.00, 20.00, NOW()),
(@abo_theatre,       11, '2026-08-01', '2026-08-31', 'ACTIVE', 10900.00, 20.00, NOW()),
(@abo_chellah,       11, '2026-08-01', '2026-08-31', 'ACTIVE',  8800.00, 20.00, NOW()),
(@abo_rabia,         11, '2026-08-01', '2026-08-31', 'ACTIVE',  6800.00, 20.00, NOW()),
(@abo_russie,        11, '2026-08-01', '2026-08-31', 'ACTIVE',  5000.00, 20.00, NOW()),
(@abo_corp_iam,      11, '2026-08-01', '2026-08-31', 'ACTIVE', 17400.00, 20.00, NOW()),
(@abo_corp_cdg,      11, '2026-08-01', '2026-08-31', 'ACTIVE', 13800.00, 20.00, NOW()),
(@abo_corp_attijari, 11, '2026-08-01', '2026-08-31', 'ACTIVE',  8200.00, 20.00, NOW()),
(@abo_corp_oncf,     11, '2026-08-01', '2026-08-31', 'ACTIVE',  5800.00, 20.00, NOW());

-- == MOIS 12 : SEPTEMBRE 2026 (Mois Courant) ==
INSERT INTO periode_abonnement (abonnement_id, numero, date_debut, date_fin, statut, prixhtapplique, tauxtvaapplique, date_creation) VALUES
(@abo_badr,          12, '2026-09-01', '2026-09-30', 'ACTIVE', 15200.00, 20.00, NOW()),
(@abo_had,           12, '2026-09-01', '2026-09-30', 'ACTIVE', 12900.00, 20.00, NOW()),
(@abo_theatre,       12, '2026-09-01', '2026-09-30', 'ACTIVE', 11400.00, 20.00, NOW()),
(@abo_chellah,       12, '2026-09-01', '2026-09-30', 'ACTIVE',  9200.00, 20.00, NOW()),
(@abo_rabia,         12, '2026-09-01', '2026-09-30', 'ACTIVE',  7100.00, 20.00, NOW()),
(@abo_russie,        12, '2026-09-01', '2026-09-30', 'ACTIVE',  5300.00, 20.00, NOW()),
(@abo_corp_iam,      12, '2026-09-01', '2026-09-30', 'ACTIVE', 18000.00, 20.00, NOW()),
(@abo_corp_cdg,      12, '2026-09-01', '2026-09-30', 'ACTIVE', 14200.00, 20.00, NOW()),
(@abo_corp_attijari, 12, '2026-09-01', '2026-09-30', 'ACTIVE',  8600.00, 20.00, NOW()),
(@abo_corp_oncf,     12, '2026-09-01', '2026-09-30', 'ACTIVE',  6100.00, 20.00, NOW());

-- ==============================================================================
-- Fin du script : 120 périodes complètes insérées avec succès !
-- ==============================================================================
