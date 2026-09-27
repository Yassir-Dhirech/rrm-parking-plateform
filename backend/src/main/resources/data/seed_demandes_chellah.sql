-- ==============================================================================
-- Script de Seed : Nouvelles Demandes Réalistes pour le Parking Chellah (Rabat)
-- ==============================================================================
-- Exécutez ce script dans votre base de données rrm_db (via phpMyAdmin, MySQL Workbench ou docker exec).
-- Il insère :
-- 1. L'affectation active de l'agent (agent@rrm.ma) au parking Chellah
-- 2. Des clients marocains authentiques (Benjelloun, El Idrissi, Tazi, Berrada, Alami, Chraibi)
-- 3. Leurs véhicules immatriculés à Rabat (-1)
-- 4. Les demandes d'abonnement en statut EN_ATTENTE_PAIEMENT (visibles au guichet agent)
-- ==============================================================================

USE rrm_db;

-- ------------------------------------------------------------------------------
-- 1. Récupération des IDs clés (Parking Chellah & Agent)
-- ------------------------------------------------------------------------------
SET @parking_id := (
    SELECT id FROM parking 
    WHERE code IN ('BAB_CHELLAH', 'PARKING_CHELLAH') 
       OR nom LIKE '%Chellah%' 
    ORDER BY id ASC LIMIT 1
);

SET @agent_id := (
    SELECT id FROM utilisateur 
    WHERE email = 'agent@rrm.ma' 
    LIMIT 1
);

-- Si aucun tarif n'existe spécifiquement, on prend le premier tarif associé à ce parking
SET @tarif_id := (
    SELECT id FROM tarif_parking 
    WHERE parking_id = @parking_id 
    LIMIT 1
);

-- Si la table tarif_parking n'a pas encore de tarif pour ce parking, en prendre un par défaut
SET @tarif_id := COALESCE(@tarif_id, (SELECT id FROM tarif_parking LIMIT 1));

-- ------------------------------------------------------------------------------
-- 2. Affectation active de l'agent au Parking Chellah
-- ------------------------------------------------------------------------------
UPDATE affectation_agent_parking 
SET active = 0 
WHERE utilisateur_id = @agent_id;

INSERT INTO affectation_agent_parking (utilisateur_id, parking_id, date_debut, active)
VALUES (@agent_id, @parking_id, CURRENT_DATE(), 1)
ON DUPLICATE KEY UPDATE active = 1, parking_id = @parking_id;

-- ------------------------------------------------------------------------------
-- 3. Insertion des Clients Particuliers (Noms & CIN marocains authentiques)
-- ------------------------------------------------------------------------------

-- Client 1 : Mehdi Benjelloun
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('mehdi.benjelloun@gmail.com', '0661245890', 'ACTIF', NOW(), NOW());
SET @client_1 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_1, 'Benjelloun', 'Mehdi', 'A748291');

-- Client 2 : Fatima-Zahra El Idrissi
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('fz.elidrissi@gmail.com', '0663451278', 'ACTIF', NOW(), NOW());
SET @client_2 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_2, 'El Idrissi', 'Fatima-Zahra', 'AB592014');

-- Client 3 : Youssef Tazi
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('youssef.tazi@outlook.com', '0670889123', 'ACTIF', NOW(), NOW());
SET @client_3 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_3, 'Tazi', 'Youssef', 'AA384920');

-- Client 4 : Khadija Berrada
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('khadija.berrada@yahoo.fr', '0654321098', 'ACTIF', NOW(), NOW());
SET @client_4 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_4, 'Berrada', 'Khadija', 'C920184');

-- Client 5 : Omar Alami
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('omar.alami.maroc@gmail.com', '0662198234', 'ACTIF', NOW(), NOW());
SET @client_5 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_5, 'Alami', 'Omar', 'AY102938');

-- Client 6 : Salma Chraibi
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('salma.chraibi@gmail.com', '0668774411', 'ACTIF', NOW(), NOW());
SET @client_6 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_6, 'Chraibi', 'Salma', 'BE847291');

-- ------------------------------------------------------------------------------
-- 4. Insertion des Véhicules (Plaques d'immatriculation marocaines : Rabat -1)
-- ------------------------------------------------------------------------------
INSERT INTO vehicule (immatriculation, marque, modele, couleur, type, statut, client_id, date_creation, date_modification)
VALUES 
('45892-A-1', 'Dacia', 'Sandero Stepway', 'Gris Comète', 'VOITURE', 'ACTIF', @client_1, NOW(), NOW()),
('18243-B-1', 'Peugeot', '208', 'Blanc Nacré', 'VOITURE', 'ACTIF', @client_2, NOW(), NOW()),
('76291-A-1', 'Volkswagen', 'Golf 8', 'Noir Intense', 'VOITURE', 'ACTIF', @client_3, NOW(), NOW()),
('33412-D-1', 'Renault', 'Clio 5', 'Bleu Iron', 'VOITURE', 'ACTIF', @client_4, NOW(), NOW()),
('61204-A-1', 'Toyota', 'Yaris Hybride', 'Rouge Fusion', 'VOITURE', 'ACTIF', @client_5, NOW(), NOW()),
('89123-A-1', 'Hyundai', 'Tucson', 'Gris Foncé', 'VOITURE', 'ACTIF', @client_6, NOW(), NOW());

SET @vehicule_1 := (SELECT id FROM vehicule WHERE immatriculation = '45892-A-1');
SET @vehicule_2 := (SELECT id FROM vehicule WHERE immatriculation = '18243-B-1');
SET @vehicule_3 := (SELECT id FROM vehicule WHERE immatriculation = '76291-A-1');
SET @vehicule_4 := (SELECT id FROM vehicule WHERE immatriculation = '33412-D-1');
SET @vehicule_5 := (SELECT id FROM vehicule WHERE immatriculation = '61204-A-1');
SET @vehicule_6 := (SELECT id FROM vehicule WHERE immatriculation = '89123-A-1');

-- ------------------------------------------------------------------------------
-- 5. Insertion des Demandes d'Abonnement pour le Parking Chellah
-- ------------------------------------------------------------------------------

-- Demande 1 (EN_ATTENTE_PAIEMENT - Créée il y a 2h)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-CHEL01', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_1, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 2 HOUR));
SET @demande_1 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_1, @tarif_id, @vehicule_1, 'ESPECE');

-- Demande 2 (EN_ATTENTE_PAIEMENT - Créée il y a 5h)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-CHEL02', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_2, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 5 HOUR));
SET @demande_2 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_2, @tarif_id, @vehicule_2, 'ESPECE');

-- Demande 3 (EN_ATTENTE_PAIEMENT - Créée il y a 1 jour)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-CHEL03', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_3, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY));
SET @demande_3 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_3, @tarif_id, @vehicule_3, 'CHEQUE');

-- Demande 4 (EN_ATTENTE_PAIEMENT - En retard +48h pour tester l'alerte rouge du dashboard)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-CHEL04', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_4, DATE_SUB(NOW(), INTERVAL 52 HOUR), DATE_SUB(NOW(), INTERVAL 52 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 52 HOUR));
SET @demande_4 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_4, @tarif_id, @vehicule_4, 'ESPECE');

-- Demande 5 (EN_ATTENTE_PAIEMENT - Assistée par l'agent au guichet)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, initiee_par_utilisateur_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-CHEL05', 'EN_ATTENTE_PAIEMENT', 'ASSISTE_PAR_AGENT', @client_5, @agent_id, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE), NOW(), DATE_SUB(NOW(), INTERVAL 30 MINUTE));
SET @demande_5 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_5, @tarif_id, @vehicule_5, 'ESPECE');

-- Demande 6 (SOUMISE - En attente de validation OTP)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification)
VALUES ('DEM-20260927-CHEL06', 'SOUMISE', 'EN_LIGNE', @client_6, DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 15 MINUTE), NOW());
SET @demande_6 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_6, @tarif_id, @vehicule_6, 'ESPECE');

-- ------------------------------------------------------------------------------
-- 6. Insertion de l'historique des statuts
-- ------------------------------------------------------------------------------
INSERT INTO historique_statut_demande (demande_id, ancien_statut, nouveau_statut, origine, date_changement, motif)
VALUES 
(@demande_1, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Validation OTP effectuée'),
(@demande_2, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'Validation OTP effectuée'),
(@demande_3, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Validation OTP effectuée'),
(@demande_4, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 52 HOUR), 'Validation OTP effectuée'),
(@demande_5, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'UTILISATEUR_INTERNE', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 'Création assistée au guichet'),
(@demande_6, NULL, 'SOUMISE', 'CLIENT', DATE_SUB(NOW(), INTERVAL 15 MINUTE), 'Formulaire soumis en ligne');

-- ==============================================================================
-- Fin du script : Les données sont prêtes à être visualisées dans l'espace Agent !
-- ==============================================================================
