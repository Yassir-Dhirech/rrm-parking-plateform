-- ==============================================================================
-- Script de Seed : Demandes Réalistes pour TOUS LES PARKINGS de Rabat
-- ==============================================================================
-- Exécutez ce script dans phpMyAdmin (http://localhost:8082) sur la base rrm_db.
-- Il insère des demandes réparties sur les différents parkings de Rabat :
-- 1. Parking Bab El Had
-- 2. Parking Théâtre Mohammed V
-- 3. Parking Badr (Agdal)
-- 4. Parking Rabia Al Adaouia
-- 5. Parking Place de Russie
-- 6. Parking Bab Fès
-- ==============================================================================

USE rrm_db;

-- ------------------------------------------------------------------------------
-- 1. Récupération des Tarifs par Parking
-- ------------------------------------------------------------------------------

-- Parking Bab El Had
SET @parking_had := (SELECT id FROM parking WHERE code = 'BAB_EL_HAD' OR nom LIKE '%Bab El Had%' ORDER BY id ASC LIMIT 1);
SET @tarif_had := (SELECT id FROM tarif_parking WHERE parking_id = @parking_had LIMIT 1);
SET @tarif_had := COALESCE(@tarif_had, (SELECT id FROM tarif_parking LIMIT 1));

-- Parking Théâtre Mohammed V
SET @parking_theatre := (SELECT id FROM parking WHERE code = 'THEATRE_MOHAMMED_V' OR nom LIKE '%Théâtre%' ORDER BY id ASC LIMIT 1);
SET @tarif_theatre := (SELECT id FROM tarif_parking WHERE parking_id = @parking_theatre LIMIT 1);
SET @tarif_theatre := COALESCE(@tarif_theatre, (SELECT id FROM tarif_parking LIMIT 1));

-- Parking Badr (Agdal)
SET @parking_badr := (SELECT id FROM parking WHERE code = 'BADR' OR nom LIKE '%Badr%' ORDER BY id ASC LIMIT 1);
SET @tarif_badr := (SELECT id FROM tarif_parking WHERE parking_id = @parking_badr LIMIT 1);
SET @tarif_badr := COALESCE(@tarif_badr, (SELECT id FROM tarif_parking LIMIT 1));

-- Parking Rabia Al Adaouia
SET @parking_rabia := (SELECT id FROM parking WHERE code = 'RABIA_AL_ADAOUIA' OR nom LIKE '%Rabia%' ORDER BY id ASC LIMIT 1);
SET @tarif_rabia := (SELECT id FROM tarif_parking WHERE parking_id = @parking_rabia LIMIT 1);
SET @tarif_rabia := COALESCE(@tarif_rabia, (SELECT id FROM tarif_parking LIMIT 1));

-- Parking Place de Russie
SET @parking_russie := (SELECT id FROM parking WHERE code = 'PLACE_RUSSIE' OR nom LIKE '%Russie%' ORDER BY id ASC LIMIT 1);
SET @tarif_russie := (SELECT id FROM tarif_parking WHERE parking_id = @parking_russie LIMIT 1);
SET @tarif_russie := COALESCE(@tarif_russie, (SELECT id FROM tarif_parking LIMIT 1));

-- Parking Bab Fès
SET @parking_fes := (SELECT id FROM parking WHERE code = 'BAB_FES' OR nom LIKE '%Fès%' OR nom LIKE '%Fes%' ORDER BY id ASC LIMIT 1);
SET @tarif_fes := (SELECT id FROM tarif_parking WHERE parking_id = @parking_fes LIMIT 1);
SET @tarif_fes := COALESCE(@tarif_fes, (SELECT id FROM tarif_parking LIMIT 1));


-- ------------------------------------------------------------------------------
-- 2. Insertion des Clients
-- ------------------------------------------------------------------------------

-- Client 7 : Omar Bennani (Bab El Had)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('omar.bennani@gmail.com', '0661112233', 'ACTIF', NOW(), NOW());
SET @client_7 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_7, 'Bennani', 'Omar', 'B589214');

-- Client 8 : Salma Fassi Fihri (Bab El Had)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('salma.fassifihri@yahoo.fr', '0662334455', 'ACTIF', NOW(), NOW());
SET @client_8 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_8, 'Fassi Fihri', 'Salma', 'CD782190');

-- Client 9 : Yassine Belhaj (Théâtre Mohammed V)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('yassine.belhaj@outlook.com', '0663556677', 'ACTIF', NOW(), NOW());
SET @client_9 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_9, 'Belhaj', 'Yassine', 'A341256');

-- Client 10 : Fatima Zahra Alami (Théâtre Mohammed V)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('fz.alami.rabat@gmail.com', '0664778899', 'ACTIF', NOW(), NOW());
SET @client_10 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_10, 'Alami', 'Fatima Zahra', 'X901243');

-- Client 11 : Adil Sqalli (Parking Badr Agdal)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('adil.sqalli@gmail.com', '0665990011', 'ACTIF', NOW(), NOW());
SET @client_11 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_11, 'Sqalli', 'Adil', 'D451298');

-- Client 12 : Meryem Chaoui (Parking Badr Agdal)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('meryem.chaoui@gmail.com', '0666112244', 'ACTIF', NOW(), NOW());
SET @client_12 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_12, 'Chaoui', 'Meryem', 'BK561234');

-- Client 13 : Hamza Mansouri (Parking Rabia Al Adaouia)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('hamza.mansouri@hotmail.com', '0667223355', 'ACTIF', NOW(), NOW());
SET @client_13 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_13, 'Mansouri', 'Hamza', 'AA128945');

-- Client 14 : Zineb Lahlou (Parking Bab Fès)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('zineb.lahlou@gmail.com', '0668334466', 'ACTIF', NOW(), NOW());
SET @client_14 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_14, 'Lahlou', 'Zineb', 'C789123');

-- Client 15 : Tarik Benchekroun (Place de Russie)
INSERT INTO client (email, telephone, statut, date_creation, date_modification)
VALUES ('tarik.benchekroun@gmail.com', '0669445577', 'ACTIF', NOW(), NOW());
SET @client_15 := LAST_INSERT_ID();
INSERT INTO client_particulier (id, nom, prenom, cin)
VALUES (@client_15, 'Benchekroun', 'Tarik', 'AB654321');


-- ------------------------------------------------------------------------------
-- 3. Insertion des Véhicules
-- ------------------------------------------------------------------------------
INSERT INTO vehicule (immatriculation, marque, modele, couleur, type, statut, client_id, date_creation, date_modification)
VALUES 
('10245-A-1', 'Mercedes-Benz', 'Classe A', 'Gris Montagne', 'VOITURE', 'ACTIF', @client_7, NOW(), NOW()),
('55231-B-1', 'Audi', 'A3', 'Noir Mythic', 'VOITURE', 'ACTIF', @client_8, NOW(), NOW()),
('88902-A-1', 'Volkswagen', 'Tiguan', 'Gris Platine', 'VOITURE', 'ACTIF', @client_9, NOW(), NOW()),
('42109-D-1', 'Seat', 'Ibiza', 'Rouge Désir', 'VOITURE', 'ACTIF', @client_10, NOW(), NOW()),
('19842-A-1', 'BMW', 'Série 1', 'Bleu Misano', 'VOITURE', 'ACTIF', @client_11, NOW(), NOW()),
('67231-A-1', 'Nissan', 'Qashqai', 'Blanc Nacré', 'VOITURE', 'ACTIF', @client_12, NOW(), NOW()),
('31094-B-1', 'Kia', 'Sportage', 'Gris Acier', 'VOITURE', 'ACTIF', @client_13, NOW(), NOW()),
('74512-A-1', 'Hyundai', 'i20', 'Bleu Intense', 'VOITURE', 'ACTIF', @client_14, NOW(), NOW()),
('92014-A-1', 'Ford', 'Focus', 'Noir Shadow', 'VOITURE', 'ACTIF', @client_15, NOW(), NOW());

SET @vehicule_7 := (SELECT id FROM vehicule WHERE immatriculation = '10245-A-1');
SET @vehicule_8 := (SELECT id FROM vehicule WHERE immatriculation = '55231-B-1');
SET @vehicule_9 := (SELECT id FROM vehicule WHERE immatriculation = '88902-A-1');
SET @vehicule_10 := (SELECT id FROM vehicule WHERE immatriculation = '42109-D-1');
SET @vehicule_11 := (SELECT id FROM vehicule WHERE immatriculation = '19842-A-1');
SET @vehicule_12 := (SELECT id FROM vehicule WHERE immatriculation = '67231-A-1');
SET @vehicule_13 := (SELECT id FROM vehicule WHERE immatriculation = '31094-B-1');
SET @vehicule_14 := (SELECT id FROM vehicule WHERE immatriculation = '74512-A-1');
SET @vehicule_15 := (SELECT id FROM vehicule WHERE immatriculation = '92014-A-1');


-- ------------------------------------------------------------------------------
-- 4. Insertion des Demandes Réparties sur Tous les Parkings
-- ------------------------------------------------------------------------------

-- Parking Bab El Had (Omar Bennani)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-HAD01', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_7, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 3 HOUR));
SET @demande_7 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_7, @tarif_had, @vehicule_7, 'ESPECE');

-- Parking Bab El Had (Salma Fassi Fihri)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-HAD02', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_8, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 6 HOUR));
SET @demande_8 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_8, @tarif_had, @vehicule_8, 'CHEQUE');

-- Parking Théâtre Mohammed V (Yassine Belhaj)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-THEA01', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_9, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 1 HOUR));
SET @demande_9 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_9, @tarif_theatre, @vehicule_9, 'ESPECE');

-- Parking Théâtre Mohammed V (Fatima Zahra Alami)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification)
VALUES ('DEM-20260927-THEA02', 'SOUMISE', 'EN_LIGNE', @client_10, DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 45 MINUTE), NOW());
SET @demande_10 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_10, @tarif_theatre, @vehicule_10, 'ESPECE');

-- Parking Badr Agdal (Adil Sqalli)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-BADR01', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_11, DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 8 HOUR));
SET @demande_11 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_11, @tarif_badr, @vehicule_11, 'ESPECE');

-- Parking Badr Agdal (Meryem Chaoui)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-BADR02', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_12, DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 12 HOUR));
SET @demande_12 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_12, @tarif_badr, @vehicule_12, 'ESPECE');

-- Parking Rabia Al Adaouia (Hamza Mansouri)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-RABIA01', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_13, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), NOW(), DATE_SUB(NOW(), INTERVAL 4 HOUR));
SET @demande_13 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_13, @tarif_rabia, @vehicule_13, 'CHEQUE');

-- Parking Bab Fès (Zineb Lahlou)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-FES01', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_14, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 2 DAY));
SET @demande_14 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_14, @tarif_fes, @vehicule_14, 'ESPECE');

-- Parking Place de Russie (Tarik Benchekroun)
INSERT INTO demande_client (reference, statut, canal_initiation, client_id, date_creation, date_soumission, date_modification, date_validation_otp)
VALUES ('DEM-20260927-RUSSIE01', 'EN_ATTENTE_PAIEMENT', 'EN_LIGNE', @client_15, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY));
SET @demande_15 := LAST_INSERT_ID();
INSERT INTO demande_nouvel_abonnement_regulier (id, tarif_parking_id, vehicule_id, mode_paiement_souhaite)
VALUES (@demande_15, @tarif_russie, @vehicule_15, 'ESPECE');


-- ------------------------------------------------------------------------------
-- 5. Historique des Statuts
-- ------------------------------------------------------------------------------
INSERT INTO historique_statut_demande (demande_id, ancien_statut, nouveau_statut, origine, date_changement, motif)
VALUES 
(@demande_7, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Validation OTP effectuée'),
(@demande_8, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 6 HOUR), 'Validation OTP effectuée'),
(@demande_9, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 1 HOUR), 'Validation OTP effectuée'),
(@demande_10, NULL, 'SOUMISE', 'CLIENT', DATE_SUB(NOW(), INTERVAL 45 MINUTE), 'Formulaire soumis en ligne'),
(@demande_11, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 8 HOUR), 'Validation OTP effectuée'),
(@demande_12, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 12 HOUR), 'Validation OTP effectuée'),
(@demande_13, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 4 HOUR), 'Validation OTP effectuée'),
(@demande_14, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Validation OTP effectuée'),
(@demande_15, 'SOUMISE', 'EN_ATTENTE_PAIEMENT', 'CLIENT', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Validation OTP effectuée');

-- ==============================================================================
-- Fin du script : Des demandes sont désormais disponibles sur tous les parkings !
-- ==============================================================================
