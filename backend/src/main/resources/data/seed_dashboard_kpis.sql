-- ==============================================================================
-- Script de Seed Corrigé : Données Réelles pour le Dashboard Agent
-- ==============================================================================
-- Exécutez ce script dans phpMyAdmin (http://localhost:8082) sur la base rrm_db.
-- ==============================================================================

USE rrm_db;

-- 1. Récupération des IDs
SET @agent_id := (SELECT id FROM utilisateur WHERE email = 'agent@rrm.ma' LIMIT 1);
SET @parking_id := (SELECT parking_id FROM affectation_agent_parking WHERE utilisateur_id = @agent_id AND active = 1 LIMIT 1);
SET @parking_id := COALESCE(@parking_id, (SELECT id FROM parking WHERE code IN ('BAB_CHELLAH', 'PARKING_CHELLAH') LIMIT 1), (SELECT id FROM parking LIMIT 1));
SET @tarif_id := (SELECT id FROM tarif_parking WHERE parking_id = @parking_id LIMIT 1);
SET @tarif_id := COALESCE(@tarif_id, (SELECT id FROM tarif_parking LIMIT 1));

-- Récupération de 3 demandes existantes pour y attacher les paiements du jour
SET @demande_p1 := (SELECT id FROM demande_client ORDER BY id ASC LIMIT 1);
SET @demande_p2 := (SELECT id FROM demande_client ORDER BY id ASC LIMIT 1 OFFSET 1);
SET @demande_p2 := COALESCE(@demande_p2, @demande_p1);
SET @demande_p3 := (SELECT id FROM demande_client ORDER BY id ASC LIMIT 1 OFFSET 2);
SET @demande_p3 := COALESCE(@demande_p3, @demande_p1);

-- ------------------------------------------------------------------------------
-- 2. Insertion des Paiements du Jour (Colonnes exactes : traite_par_utilisateur_id)
-- ------------------------------------------------------------------------------
-- Paiement 1 : 500 DH Espèces
INSERT INTO paiement (reference, demande_id, montant, mode_paiement, statut, date_creation, date_confirmation, traite_par_utilisateur_id)
VALUES ('PAI-20260927-001', @demande_p1, 500.00, 'ESPECE', 'CONFIRME', NOW(), NOW(), @agent_id);

-- Paiement 2 : 500 DH Espèces
INSERT INTO paiement (reference, demande_id, montant, mode_paiement, statut, date_creation, date_confirmation, traite_par_utilisateur_id)
VALUES ('PAI-20260927-002', @demande_p2, 500.00, 'ESPECE', 'CONFIRME', NOW(), NOW(), @agent_id);

-- Paiement 3 : 1000 DH Chèque
INSERT INTO paiement (reference, demande_id, montant, mode_paiement, statut, date_creation, date_confirmation, traite_par_utilisateur_id, numero_cheque, banque_cheque, date_emission_cheque, statut_cheque)
VALUES ('PAI-20260927-003', @demande_p3, 1000.00, 'CHEQUE', 'CONFIRME', NOW(), NOW(), @agent_id, 'CHQ-894102', 'Attijariwafa Bank', CURRENT_DATE(), 'EN_ATTENTE_DEPOT');


-- ------------------------------------------------------------------------------
-- 3. Insertion des Abonnements et Cartes pour alimenter les compteurs
-- ------------------------------------------------------------------------------
-- Création de 2 clients pour les cartes
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES 
('client.carte1@rrm.ma', '0661998877', 'ACTIF', NOW(), NOW()),
('client.carte2@rrm.ma', '0661998888', 'ACTIF', NOW(), NOW());

SET @cl_carte1 := LAST_INSERT_ID();
SET @cl_carte2 := @cl_carte1 + 1;

INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES 
(@cl_carte1, 'Amrani', 'Youssef', 'A998877'),
(@cl_carte2, 'Drissi', 'Nadia', 'B998888');

-- 2 Abonnements Réguliers
INSERT INTO abonnement (reference, type_abonnement, date_creation)
VALUES 
('ABO-2026-IMP01', 'REGULIER', NOW()),
('ABO-2026-REM01', 'REGULIER', NOW());

SET @abo_imp := LAST_INSERT_ID();
SET @abo_rem := @abo_imp + 1;

INSERT INTO abonnement_regulier (id, client_particulier_id)
VALUES 
(@abo_imp, @cl_carte1),
(@abo_rem, @cl_carte2);

-- Affectations au parking actif de l'agent
INSERT INTO affectation_parking (abonnement_regulier_id, parking_id, date_debut)
VALUES 
(@abo_imp, @parking_id, CURRENT_DATE()),
(@abo_rem, @parking_id, CURRENT_DATE());

-- Période active
INSERT INTO periode_abonnement (abonnement_id, numero_periode, date_debut, date_fin, statut, date_creation)
VALUES 
(@abo_imp, 1, CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), 'ACTIVE', NOW()),
(@abo_rem, 1, CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH), 'ACTIVE', NOW());

-- 2 Cartes d'accès liées
INSERT INTO carte_acces (reference, abonnement_id, statut, date_creation)
VALUES 
('CARTE-2026-IMP01', @abo_imp, 'A_IMPRIMER', NOW()),
('CARTE-2026-REM01', @abo_rem, 'IMPRIMEE', NOW());

SET @carte_imp := LAST_INSERT_ID();
SET @carte_rem := @carte_imp + 1;

-- ------------------------------------------------------------------------------
-- 4. Insertion des Demandes Opérationnelles (Cartes à imprimer & à remettre)
-- ------------------------------------------------------------------------------
-- 1 Carte à Imprimer
INSERT INTO demande_operationnelle (reference, carte_acces_id, type_operation, statut, creee_par_utilisateur_id, date_creation)
VALUES 
('OP-IMP-20260927-01', @carte_imp, 'IMPRESSION', 'EN_COURS', @agent_id, NOW());

-- 1 Carte à Remettre
INSERT INTO demande_operationnelle (reference, carte_acces_id, type_operation, statut, creee_par_utilisateur_id, date_creation)
VALUES 
('OP-REM-20260927-01', @carte_rem, 'REMISE', 'EN_COURS', @agent_id, NOW());

-- ==============================================================================
-- Fin du script : Données corrigées prêtes pour phpMyAdmin !
-- ==============================================================================
