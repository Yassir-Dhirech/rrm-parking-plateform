-- Script d'initialisation automatique pour RRM Parking Platform (MySQL 8.0)
-- Exécuté automatiquement par MySQL lors du premier démarrage du conteneur

CREATE DATABASE IF NOT EXISTS rrm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rrm_db;

-- 1. Table Parking
CREATE TABLE IF NOT EXISTS `parking` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL,
  `nom` VARCHAR(150) NOT NULL,
  `adresse` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10,7) DEFAULT NULL,
  `longitude` DECIMAL(10,7) DEFAULT NULL,
  `capacite_totale` INT NOT NULL,
  `capacite_reservee_abonnements` INT NOT NULL,
  `statut` VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
  `date_creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_archivage` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_parking_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des 13 Parkings officiels de Rabat
INSERT INTO `parking` (`id`, `code`, `nom`, `adresse`, `latitude`, `longitude`, `capacite_totale`, `capacite_reservee_abonnements`, `statut`) VALUES
(1, 'PLACE_RUSSIE', 'Place Russie', 'Place Russie, Rabat', 34.0194324, -6.8499338, 160, 50, 'ACTIF'),
(2, 'BAB_FES', 'Bab Fès', 'Bab Fès, Salé', 34.0346725, -6.8187564, 100, 30, 'ACTIF'),
(3, 'THEATRE_MOHAMMED_V', 'Théâtre Mohammed V', 'Avenue Moulay Rachid, Rabat', 34.0197807, -6.8324148, 300, 100, 'ACTIF'),
(4, 'PLACE_ITALIE', 'Place d''Italie', 'Place d''Italie, Rabat', 34.0224840, -6.8497740, 140, 45, 'ACTIF'),
(5, 'RABIA_AL_ADAOUIA', 'Rabia Al Adaouia', 'Avenue Allal Ben Abdellah, Rabat', 34.0005790, -6.8449810, 120, 40, 'ACTIF'),
(6, 'BADR', 'Badr', 'Agdal, Rabat', 33.9999779, -6.8498258, 180, 60, 'ACTIF'),
(7, 'OULED_DLIM', 'Ouled Dlim', 'Avenue Hassan II, Rabat', 33.9454873, -6.8895056, 100, 30, 'ACTIF'),
(8, 'BAB_CHELLAH', 'Bab Chellah', 'Bab Chellah, Rabat', 34.0156000, -6.8325000, 120, 40, 'ACTIF'),
(9, 'BAB_EL_HAD', 'Bab El Had', 'Bab El Had, Rabat', 34.0232000, -6.8394000, 250, 80, 'ACTIF'),
(10, 'HARHOURA_NORD', 'Harhoura Nord', 'Plage Harhoura Nord', 33.9364158, -6.9415517, 150, 50, 'ACTIF'),
(11, 'RUE_BRUXELLES', 'Rue Bruxelles', 'Rue Bruxelles, Rabat', 34.0206174, -6.8481035, 130, 40, 'ACTIF'),
(12, 'HARHOURA_SURFACE', 'Harhoura en surface', 'Harhoura Littoral', 33.9365170, -6.9409824, 200, 70, 'ACTIF'),
(13, 'PARKING_CHELLAH', 'Parking Chellah', 'Chellah, Rabat', 34.0063845, -6.8250930, 220, 70, 'ACTIF')
ON DUPLICATE KEY UPDATE `nom` = VALUES(`nom`);
