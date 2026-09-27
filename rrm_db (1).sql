-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Sep 27, 2026 at 12:37 PM
-- Server version: 8.0.46
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rrm_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `abonnement`
--

CREATE TABLE `abonnement` (
  `id` bigint NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_modification` datetime(6) NOT NULL,
  `reference` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ACTIF','EN_ATTENTE_ACTIVATION','EXPIRE','RESILIE','SUSPENDU') COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `abonnement`
--

INSERT INTO `abonnement` (`id`, `date_creation`, `date_modification`, `reference`, `statut`) VALUES
(1, '2026-09-17 17:16:44.419057', '2026-09-17 17:16:44.419057', 'ABO-20260917-DE8F80C2', 'ACTIF'),
(2, '2026-09-19 15:15:02.581524', '2026-09-20 20:51:00.769448', 'ABO-20260919-1F7689D6', 'EXPIRE'),
(3, '2026-09-19 18:04:54.214995', '2026-09-19 18:04:54.214995', 'ABO-20260919-3D62713A', 'ACTIF'),
(4, '2026-09-22 15:27:38.000000', '2026-09-22 15:27:38.000000', 'ABO-TEST-MEDUSE', 'ACTIF'),
(5, '2026-09-22 15:27:38.000000', '2026-09-22 15:27:38.000000', 'ABO-TEST-THOR', 'ACTIF'),
(6, '2026-09-22 15:27:39.000000', '2026-09-22 22:53:21.609888', 'ABO-TEST-ZEUS', 'ACTIF'),
(7, '2026-09-25 00:40:51.675507', '2026-09-25 00:40:51.675507', 'ABO-CORP-20260925-2868645B', 'ACTIF'),
(8, '2026-09-25 09:42:23.268519', '2026-09-25 09:42:23.268519', 'ABO-CORP-20260925-C1182A30', 'ACTIF'),
(9, '2026-09-25 15:10:39.898443', '2026-09-25 15:10:39.898443', 'ABO-20260925-E2CF0078', 'ACTIF'),
(10, '2026-09-26 00:42:55.002334', '2026-09-26 00:42:55.002334', 'ABO-CORP-20260926-8A9CC08E', 'ACTIF'),
(11, '2026-09-26 02:28:02.278411', '2026-09-26 02:28:02.278411', 'ABO-20260926-5D91690B', 'ACTIF'),
(12, '2026-09-27 12:29:51.000000', '2026-09-27 12:29:51.000000', 'ABO-2026-001', 'ACTIF'),
(13, '2026-09-27 12:29:51.000000', '2026-09-27 12:29:51.000000', 'ABO-2026-002', 'ACTIF');

-- --------------------------------------------------------

--
-- Table structure for table `abonnement_entreprise`
--

CREATE TABLE `abonnement_entreprise` (
  `id` bigint NOT NULL,
  `contrat_corporate_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `abonnement_entreprise`
--

INSERT INTO `abonnement_entreprise` (`id`, `contrat_corporate_id`) VALUES
(7, 2),
(8, 3),
(10, 4);

-- --------------------------------------------------------

--
-- Table structure for table `abonnement_entreprise_vehicule`
--

CREATE TABLE `abonnement_entreprise_vehicule` (
  `abonnement_entreprise_id` bigint NOT NULL,
  `vehicule_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `abonnement_regulier`
--

CREATE TABLE `abonnement_regulier` (
  `id` bigint NOT NULL,
  `client_particulier_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `abonnement_regulier`
--

INSERT INTO `abonnement_regulier` (`id`, `client_particulier_id`) VALUES
(9, 12),
(11, 13),
(1, 14),
(2, 16),
(3, 17),
(4, 18),
(5, 19),
(6, 20),
(12, 42),
(13, 43);

-- --------------------------------------------------------

--
-- Table structure for table `affectation_agent_parking`
--

CREATE TABLE `affectation_agent_parking` (
  `id` bigint NOT NULL,
  `active` bit(1) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `parking_id` bigint NOT NULL,
  `utilisateur_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `affectation_agent_parking`
--

INSERT INTO `affectation_agent_parking` (`id`, `active`, `date_debut`, `date_fin`, `parking_id`, `utilisateur_id`) VALUES
(1, b'1', '2025-01-01', NULL, 8, 3),
(2, b'0', '2025-01-01', NULL, 8, 7),
(3, b'1', '2026-09-27', NULL, 8, 7);

-- --------------------------------------------------------

--
-- Table structure for table `affectation_parking`
--

CREATE TABLE `affectation_parking` (
  `id` bigint NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `abonnement_regulier_id` bigint NOT NULL,
  `parking_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `affectation_parking`
--

INSERT INTO `affectation_parking` (`id`, `date_creation`, `date_debut`, `date_fin`, `abonnement_regulier_id`, `parking_id`) VALUES
(1, '2026-09-17 17:16:44.431166', '2026-09-17', NULL, 1, 10),
(2, '2026-09-19 15:15:02.588260', '2026-09-19', NULL, 2, 7),
(3, '2026-09-19 18:04:54.227125', '2026-09-19', NULL, 3, 10),
(4, '2026-09-22 15:27:38.000000', '2026-08-23', NULL, 4, 1),
(5, '2026-09-22 15:27:39.000000', '2026-07-24', '2026-11-21', 5, 2),
(6, '2026-09-22 15:27:39.000000', '2026-05-25', NULL, 6, 3),
(7, '2026-09-22 22:42:35.790203', '2026-11-22', NULL, 5, 7),
(8, '2026-09-25 15:10:39.904413', '2026-09-25', NULL, 9, 9),
(9, '2026-09-26 02:28:02.287983', '2026-09-26', NULL, 11, 1),
(10, '2026-09-27 12:29:51.000000', '2026-01-01', NULL, 12, 8),
(11, '2026-09-27 12:29:51.000000', '2026-01-01', NULL, 13, 8);

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` bigint NOT NULL,
  `adresse_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chemin_requete` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correlation_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_evenement` datetime(6) NOT NULL,
  `details_techniques` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `identifiant_acteur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `methode_http` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `objet_id` bigint DEFAULT NULL,
  `reference_objet` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultat` enum('ACCES_REFUSE','ECHEC','SUCCES') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_action` enum('ACTIVATION','ANNULATION','ARCHIVAGE','AUTHENTIFICATION_ECHOUEE','AUTHENTIFICATION_REUSSIE','CONSULTATION','CREATION','DESACTIVATION','EXPORT','IMPORT','IMPRESSION','MIGRATION','MODIFICATION','REFUS','SUSPENSION','TELECHARGEMENT_DOCUMENT','TELEVERSEMENT_DOCUMENT','VALIDATION') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_objet` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acteur_utilisateur_id` bigint DEFAULT NULL,
  `parking_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `adresse_ip`, `chemin_requete`, `correlation_id`, `date_evenement`, `details_techniques`, `identifiant_acteur`, `message`, `methode_http`, `objet_id`, `reference_objet`, `resultat`, `type_action`, `type_objet`, `user_agent`, `acteur_utilisateur_id`, `parking_id`) VALUES
(1, NULL, '/api/agent/demandes/13', NULL, '2026-09-26 03:27:04.362081', '{\"avant\":{\"nom\":\"Mehdi\",\"prenom\":\"Boumlik\",\"cin\":\"AB123456\",\"email\":\"achraf.ouazzane00@gmail.com\",\"telephone\":\"+212615914461\",\"immatriculation\":\"665323|ل|15\",\"marque\":\"Audi Q8\",\"modele\":null,\"couleur\":null,\"typeVehicule\":\"VOITURE\",\"tarifParkingId\":129,\"parking\":\"Bab Fès\",\"forfait\":\"Rahti - nuit 7j/7 18h-09h et week-end 24h/24\",\"dureeMois\":3,\"modePaiement\":\"CHEQUE\"},\"apres\":{\"nom\":\"Mehdi\",\"prenom\":\"Boumlik\",\"cin\":\"AB123456\",\"email\":\"achraf.ouazzane00@gmail.com\",\"telephone\":\"+212615914461\",\"immatriculation\":\"665323|ل|15\",\"marque\":\"Audi Q8\",\"modele\":null,\"couleur\":null,\"typeVehicule\":\"VOITURE\",\"tarifParkingId\":170,\"parking\":\"Bab Chellah\",\"forfait\":\"24h/24 et 7j/7 place non réservée\",\"dureeMois\":6,\"modePaiement\":\"CHEQUE\"},\"documentsRemplaces\":[]}', 'agent.paiement@rrm.ma', 'Demande modifiée avant paiement', 'PUT', 13, 'DEM-20260916-D291A69E', 'SUCCES', 'MODIFICATION', 'DEMANDE_CLIENT', NULL, 3, 8);

-- --------------------------------------------------------

--
-- Table structure for table `carte_acces`
--

CREATE TABLE `carte_acces` (
  `id` bigint NOT NULL,
  `date_activation` datetime(6) DEFAULT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_desactivation` datetime(6) DEFAULT NULL,
  `date_expiration` datetime(6) DEFAULT NULL,
  `date_impression` datetime(6) DEFAULT NULL,
  `date_suspension` datetime(6) DEFAULT NULL,
  `motif_derniere_operation` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_carte` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ACTIVE','A_ACTIVER','A_IMPRIMER','DESACTIVEE','EN_PREPARATION','EXPIREE','IMPRIMEE','SUSPENDUE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` bigint NOT NULL,
  `abonnement_id` bigint NOT NULL,
  `immatriculation_affectee` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carte_acces`
--

INSERT INTO `carte_acces` (`id`, `date_activation`, `date_creation`, `date_desactivation`, `date_expiration`, `date_impression`, `date_suspension`, `motif_derniere_operation`, `numero_carte`, `reference`, `statut`, `version`, `abonnement_id`, `immatriculation_affectee`) VALUES
(1, '2026-09-21 20:41:37.038463', '2026-09-17 17:16:44.441076', NULL, NULL, '2026-09-19 16:17:39.698796', NULL, NULL, 'RFID-20260919-001', 'CARTE-20260917-E57D6DB2', 'ACTIVE', 5, 1, NULL),
(2, NULL, '2026-09-19 15:15:02.600412', NULL, '2026-09-20 20:51:00.042520', NULL, NULL, 'Expiration de la carte', NULL, 'CARTE-20260919-4A54D4DA', 'EXPIREE', 2, 2, NULL),
(3, '2026-09-19 18:18:03.264244', '2026-09-19 18:04:54.237329', NULL, NULL, '2026-09-19 18:17:31.163478', NULL, NULL, '757657', 'CARTE-20260919-9BF73128', 'ACTIVE', 4, 3, NULL),
(4, '2026-09-22 16:49:24.072436', '2026-08-23 15:27:38.000000', NULL, NULL, '2026-08-24 15:27:38.000000', NULL, NULL, '900001', 'CARTE-TEST-MEDUSE', 'ACTIVE', 1, 4, NULL),
(5, '2026-09-22 22:44:23.536964', '2026-07-24 15:27:39.000000', NULL, NULL, '2026-07-25 15:27:39.000000', NULL, NULL, '900002', 'CARTE-TEST-THOR', 'ACTIVE', 1, 5, NULL),
(6, '2026-09-23 10:33:28.775432', '2026-05-25 15:27:39.000000', NULL, '2026-09-22 15:27:39.000000', '2026-05-26 15:27:39.000000', NULL, NULL, '900003', 'CARTE-TEST-ZEUS', 'ACTIVE', 3, 6, NULL),
(7, '2026-09-25 00:42:35.640450', '2026-09-25 00:40:51.721409', NULL, NULL, '2026-09-25 00:42:01.625950', NULL, NULL, '78679', 'CARTE-CORP-20260925-466421B0', 'ACTIVE', 4, 7, '12345-A-1'),
(8, '2026-09-25 00:42:37.760089', '2026-09-25 00:40:51.765488', NULL, NULL, '2026-09-25 00:41:56.316021', NULL, NULL, '556688', 'CARTE-CORP-20260925-0A5C5599', 'ACTIVE', 4, 7, '67890-B-2'),
(9, '2026-09-25 09:44:27.000311', '2026-09-25 09:42:23.307372', NULL, NULL, '2026-09-25 09:44:11.569352', NULL, NULL, '645567', 'CARTE-CORP-20260925-E417F551', 'ACTIVE', 4, 8, '11111-A-1'),
(10, '2026-09-25 09:44:29.057261', '2026-09-25 09:42:23.325221', NULL, NULL, '2026-09-25 09:44:05.047302', NULL, NULL, '1111118', 'CARTE-CORP-20260925-B1B214DA', 'ACTIVE', 4, 8, '22222-B-2'),
(11, '2026-09-25 09:44:31.029164', '2026-09-25 09:42:23.343741', NULL, NULL, '2026-09-25 09:43:53.920572', NULL, NULL, '111111', 'CARTE-CORP-20260925-F55FE49B', 'ACTIVE', 4, 8, NULL),
(12, '2026-09-25 15:12:23.355926', '2026-09-25 15:10:39.909956', NULL, NULL, '2026-09-25 15:12:04.205431', NULL, NULL, '9889', 'CARTE-20260925-1F8905B9', 'ACTIVE', 4, 9, NULL),
(13, '2026-09-26 00:44:43.414790', '2026-09-26 00:42:55.047471', NULL, NULL, '2026-09-26 00:44:01.594239', NULL, NULL, '99990', 'CARTE-CORP-20260926-5D4D1023', 'ACTIVE', 4, 10, '12345-A-1'),
(14, '2026-09-26 00:44:38.457862', '2026-09-26 00:42:55.103758', NULL, NULL, '2026-09-26 00:44:20.694951', NULL, NULL, '07070', 'CARTE-CORP-20260926-08199567', 'ACTIVE', 4, 10, '67890-B-2'),
(15, '2026-09-26 00:44:41.860565', '2026-09-26 00:42:55.114721', NULL, NULL, '2026-09-26 00:44:09.471753', NULL, NULL, '9869865', 'CARTE-CORP-20260926-D56C1D85', 'ACTIVE', 4, 10, NULL),
(16, '2026-09-26 00:44:40.206293', '2026-09-26 00:42:55.126669', NULL, NULL, '2026-09-26 00:44:14.735194', NULL, NULL, '670986', 'CARTE-CORP-20260926-8D3E933A', 'ACTIVE', 4, 10, NULL),
(17, '2026-09-26 02:32:09.248598', '2026-09-26 02:28:02.295606', NULL, NULL, '2026-09-26 02:31:48.871403', NULL, NULL, '898888', 'CARTE-20260926-5835A791', 'ACTIVE', 4, 11, NULL),
(18, NULL, '2026-09-27 12:33:18.000000', NULL, NULL, NULL, NULL, NULL, NULL, 'CARTE-2026-IMP01', 'A_IMPRIMER', 0, 12, NULL),
(19, NULL, '2026-09-27 12:33:18.000000', NULL, NULL, NULL, NULL, NULL, 'CRT-2026-0099', 'CARTE-2026-REM01', 'IMPRIMEE', 0, 13, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `id` bigint NOT NULL,
  `date_archivage` datetime(6) DEFAULT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_modification` datetime(6) NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('ACTIF','ARCHIVE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`id`, `date_archivage`, `date_creation`, `date_modification`, `email`, `statut`, `telephone`) VALUES
(3, NULL, '2026-09-12 16:54:42.061130', '2026-09-13 11:28:55.016831', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(4, NULL, '2026-09-12 22:37:30.505415', '2026-09-12 22:37:30.505415', 'achraf.ouazzane@emsi-edu.ma', 'ACTIF', '+212615914461'),
(5, NULL, '2026-09-14 19:44:40.682165', '2026-09-14 19:44:40.682165', 'wassimrebbali@gmail.com', 'ACTIF', '+212615914461'),
(7, NULL, '2026-09-15 14:53:34.855921', '2026-09-15 14:53:34.855921', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212627374757'),
(8, NULL, '2026-09-16 00:14:39.606328', '2026-09-16 00:14:39.606328', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(10, NULL, '2026-09-16 00:23:09.019159', '2026-09-16 00:23:09.019159', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(11, NULL, '2026-09-16 11:17:46.914972', '2026-09-16 11:17:46.914972', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(12, NULL, '2026-09-16 12:57:09.463435', '2026-09-25 15:02:51.920767', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(13, NULL, '2026-09-16 14:18:17.138051', '2026-09-16 14:18:17.138051', 'achraf.ouazzane@emsi-edu.ma', 'ACTIF', '+212615914461'),
(14, NULL, '2026-09-16 15:42:44.545708', '2026-09-16 15:42:44.545708', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(15, NULL, '2026-09-16 16:00:59.608321', '2026-09-16 16:05:05.931177', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(16, NULL, '2026-09-19 15:11:15.998877', '2026-09-19 15:11:15.998877', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(17, NULL, '2026-09-19 17:55:48.780102', '2026-09-22 09:05:32.000000', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(18, NULL, '2026-09-22 15:27:38.000000', '2026-09-22 15:27:38.000000', 'achraf.ouazzane00@gmail.com', 'ACTIF', '0611111111'),
(19, NULL, '2026-09-22 15:27:38.000000', '2026-09-22 15:27:38.000000', 'achraf.ouazzane00@gmail.com', 'ACTIF', '0622222222'),
(20, NULL, '2026-09-22 15:27:39.000000', '2026-09-22 15:27:39.000000', 'achraf.ouazzane00@gmail.com', 'ACTIF', '0633333333'),
(22, NULL, '2026-09-24 13:01:05.357073', '2026-09-24 13:01:05.357073', 'achraf.ouazzane00@gmail.com', 'ACTIF', '0612345678'),
(23, NULL, '2026-09-24 19:49:49.969344', '2026-09-26 00:38:55.854520', 'achraf.ouazzane00@gmail.com', 'ACTIF', '0661234567'),
(24, NULL, '2026-09-25 09:37:10.095715', '2026-09-25 09:37:46.335879', 'achraf.ouazzane00@gmail.com', 'ACTIF', '0615914461'),
(25, NULL, '2026-09-26 02:09:25.762846', '2026-09-26 02:09:25.762846', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(26, NULL, '2026-09-26 02:46:32.332447', '2026-09-26 02:46:32.332447', 'achraf.ouazzane00@gmail.com', 'ACTIF', '+212615914461'),
(27, NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', 'mehdi.benjelloun@gmail.com', 'ACTIF', '0661245890'),
(28, NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', 'fz.elidrissi@gmail.com', 'ACTIF', '0663451278'),
(29, NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', 'youssef.tazi@outlook.com', 'ACTIF', '0670889123'),
(30, NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', 'khadija.berrada@yahoo.fr', 'ACTIF', '0654321098'),
(31, NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', 'omar.alami.maroc@gmail.com', 'ACTIF', '0662198234'),
(32, NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', 'salma.chraibi@gmail.com', 'ACTIF', '0668774411'),
(33, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'omar.bennani@gmail.com', 'ACTIF', '0661112233'),
(34, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'salma.fassifihri@yahoo.fr', 'ACTIF', '0662334455'),
(35, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'yassine.belhaj@outlook.com', 'ACTIF', '0663556677'),
(36, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'fz.alami.rabat@gmail.com', 'ACTIF', '0664778899'),
(37, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'adil.sqalli@gmail.com', 'ACTIF', '0665990011'),
(38, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'meryem.chaoui@gmail.com', 'ACTIF', '0666112244'),
(39, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'hamza.mansouri@hotmail.com', 'ACTIF', '0667223355'),
(40, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'zineb.lahlou@gmail.com', 'ACTIF', '0668334466'),
(41, NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', 'tarik.benchekroun@gmail.com', 'ACTIF', '0669445577'),
(42, NULL, '2026-09-27 12:29:51.000000', '2026-09-27 12:29:51.000000', 'client.kpi1@rrm.ma', 'ACTIF', '0661112233'),
(43, NULL, '2026-09-27 12:29:51.000000', '2026-09-27 12:29:51.000000', 'client.kpi2@rrm.ma', 'ACTIF', '0661112244');

-- --------------------------------------------------------

--
-- Table structure for table `client_entreprise`
--

CREATE TABLE `client_entreprise` (
  `adresse_siege` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fonction_contact_principal` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ice` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom_contact_principal` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numerorc` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raison_sociale` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id` bigint NOT NULL,
  `prenom_contact_principal` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client_entreprise`
--

INSERT INTO `client_entreprise` (`adresse_siege`, `fonction_contact_principal`, `ice`, `nom_contact_principal`, `numerorc`, `raison_sociale`, `id`, `prenom_contact_principal`) VALUES
('Bab Chellah, Rabat', NULL, '009876543210123', 'MEDUSE', 'RC-12345', 'SOCIETE CORPORATE TEST', 22, 'TEST'),
('Avenue Annakhil, Rabat', NULL, '001234567000089', 'BENNANI', '998877', 'Maroc Telecom SA', 23, 'Karim'),
('boulevard Abdelkrim El Khattabi rue oslo apt 1', NULL, '001234567890125', 'ATLAS', 'RC-25092026-01', 'ATLAS CORPORATE TEST', 24, 'TEST');

-- --------------------------------------------------------

--
-- Table structure for table `client_particulier`
--

CREATE TABLE `client_particulier` (
  `cin` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client_particulier`
--

INSERT INTO `client_particulier` (`cin`, `nom`, `prenom`, `id`) VALUES
('X34567', 'Ouazzane', 'Oumaima', 3),
('X298009', 'Gerard', 'Piqué', 4),
('S211212', 'Rebbali', 'Wassim', 5),
('P277969', 'Houchaimine', 'Oussama', 7),
('K000000', 'Errami', 'Zouhair', 8),
('R000000', 'Larousi', 'Najlaa', 10),
('K111111', 'Ouazzane', 'Bader', 11),
('AB123456', 'Mehdi', 'Boumlik', 12),
('TP00000', 'Nolan', 'Christopher', 13),
('C676767', 'Milley', 'Bobbie Brown', 14),
('L099999', 'Hardy', 'Tom', 15),
('SL23455', 'Jaouar', 'Moustapha', 16),
('X89999', 'Dhirech', 'Yassir', 17),
('XXXXXX', 'MEDUSE', 'TEST', 18),
('YYYYYY', 'THOR', 'TEST', 19),
('ZZZZZZ', 'ZEUS', 'TEST', 20),
('S22S22', 'Lekjaa', 'Fouzi', 25),
('AX9999', 'Ouazzane', 'Achraf', 26),
('A748291', 'Benjelloun', 'Mehdi', 27),
('AB592014', 'El Idrissi', 'Fatima-Zahra', 28),
('AA384920', 'Tazi', 'Youssef', 29),
('C920184', 'Berrada', 'Khadija', 30),
('AY102938', 'Alami', 'Omar', 31),
('BE847291', 'Chraibi', 'Salma', 32),
('B589214', 'Bennani', 'Omar', 33),
('CD782190', 'Fassi Fihri', 'Salma', 34),
('A341256', 'Belhaj', 'Yassine', 35),
('X901243', 'Alami', 'Fatima Zahra', 36),
('D451298', 'Sqalli', 'Adil', 37),
('BK561234', 'Chaoui', 'Meryem', 38),
('AA128945', 'Mansouri', 'Hamza', 39),
('C789123', 'Lahlou', 'Zineb', 40),
('AB654321', 'Benchekroun', 'Tarik', 41),
('A998877', 'Amrani', 'Youssef', 42),
('B998888', 'Drissi', 'Nadia', 43);

-- --------------------------------------------------------

--
-- Table structure for table `contrat_corporate`
--

CREATE TABLE `contrat_corporate` (
  `id` bigint NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `date_modification` datetime(6) NOT NULL,
  `date_remise_au_client` datetime(6) DEFAULT NULL,
  `date_retour_signe_legalise` datetime(6) DEFAULT NULL,
  `date_signaturedg` datetime(6) DEFAULT NULL,
  `nombre_places_contractuelles` int NOT NULL,
  `reference` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ACTIF','EN_PREPARATION','EXPIRE','REMIS_AU_CLIENT','RESILIE','RETOURNE_SIGNE_LEGALISE','SIGNE_PAR_DG') COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_entreprise_id` bigint NOT NULL,
  `signe_par_utilisateur_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contrat_corporate`
--

INSERT INTO `contrat_corporate` (`id`, `date_creation`, `date_debut`, `date_fin`, `date_modification`, `date_remise_au_client`, `date_retour_signe_legalise`, `date_signaturedg`, `nombre_places_contractuelles`, `reference`, `statut`, `client_entreprise_id`, `signe_par_utilisateur_id`) VALUES
(1, '2026-09-24 14:53:30.957383', NULL, NULL, '2026-09-24 14:53:30.957383', NULL, NULL, NULL, 3, 'CTR-RRM-20260924-1D610CB0', 'EN_PREPARATION', 22, NULL),
(2, '2026-09-24 19:51:19.653260', '2026-09-25', '2046-09-24', '2026-09-25 00:40:51.750386', '2026-09-25 00:40:41.465653', '2026-09-25 00:40:48.255757', '2026-09-25 00:40:51.648086', 2, 'CTR-RRM-20260924-577B1350', 'ACTIF', 23, NULL),
(3, '2026-09-25 09:39:32.862440', '2026-09-25', '2046-09-24', '2026-09-25 09:42:23.317515', '2026-09-25 09:41:30.502751', '2026-09-25 09:42:12.990801', '2026-09-25 09:42:23.258018', 3, 'CTR-RRM-20260925-6B5D1D47', 'ACTIF', 24, NULL),
(4, '2026-09-26 00:40:24.645584', '2026-09-26', '2046-09-25', '2026-09-26 00:42:55.095754', '2026-09-26 00:42:30.392395', '2026-09-26 00:42:48.750650', '2026-09-26 00:42:54.993019', 4, 'CTR-RRM-20260926-DFCB4069', 'ACTIF', 23, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `demande_changement_parking`
--

CREATE TABLE `demande_changement_parking` (
  `date_changement_souhaitee` date DEFAULT NULL,
  `id` bigint NOT NULL,
  `abonnement_concerne_id` bigint NOT NULL,
  `affectation_generee_id` bigint DEFAULT NULL,
  `nouveau_parking_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `demande_changement_vehicule`
--

CREATE TABLE `demande_changement_vehicule` (
  `motif_changement` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nouveau_modele` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nouveau_type` enum('AUTRE','MOTO','VOITURE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nouvelle_couleur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nouvelle_immatriculation` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nouvelle_marque` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` bigint NOT NULL,
  `ancien_vehicule_id` bigint NOT NULL,
  `nouveau_vehicule_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `demande_client`
--

CREATE TABLE `demande_client` (
  `id` bigint NOT NULL,
  `canal_initiation` enum('ASSISTE_PAR_AGENT','EN_LIGNE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_modification` datetime(6) NOT NULL,
  `date_soumission` datetime(6) DEFAULT NULL,
  `date_validation_otp` datetime(6) DEFAULT NULL,
  `motif_refus` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ANNULEE','EN_ATTENTE_CORRECTION','EN_ATTENTE_FACTURATION','EN_ATTENTE_PAIEMENT','EN_ATTENTE_PAIEMENT_SIGNATURE','EN_ATTENTE_RETOUR_CONTRAT_LEGALISE','EN_ATTENTE_VALIDATION_RESPONSABLE','EN_PREPARATION_CARTES','EXPIREE','FINALISEE','PAYEE','PRETE_A_FINALISER','REFUSEE','SOUMISE','VALIDEE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` bigint NOT NULL,
  `initiee_par_utilisateur_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `demande_client`
--

INSERT INTO `demande_client` (`id`, `canal_initiation`, `date_creation`, `date_modification`, `date_soumission`, `date_validation_otp`, `motif_refus`, `reference`, `statut`, `client_id`, `initiee_par_utilisateur_id`) VALUES
(3, 'EN_LIGNE', '2026-09-12 16:54:42.074374', '2026-09-12 16:55:01.452848', '2026-09-12 16:54:42.074119', '2026-09-12 16:55:01.426361', NULL, 'DEM-20260912-7A4C3D7F', 'EN_ATTENTE_PAIEMENT', 3, NULL),
(4, 'EN_LIGNE', '2026-09-12 22:37:30.835781', '2026-09-14 09:23:55.100824', '2026-09-12 22:37:30.834007', '2026-09-12 22:37:53.161544', NULL, 'DEM-20260912-46FC9BCE', 'EN_ATTENTE_PAIEMENT', 4, NULL),
(5, 'EN_LIGNE', '2026-09-13 11:28:54.999621', '2026-09-13 11:29:13.694731', '2026-09-13 11:28:54.998959', '2026-09-13 11:29:13.670988', NULL, 'DEM-20260913-BA9BF51A', 'EN_ATTENTE_PAIEMENT', 3, NULL),
(6, 'EN_LIGNE', '2026-09-14 19:44:40.823138', '2026-09-25 15:08:38.484330', '2026-09-14 19:44:40.821512', '2026-09-14 19:45:02.833149', NULL, 'DEM-20260914-081B45A8', 'PAYEE', 5, NULL),
(7, 'EN_LIGNE', '2026-09-15 14:53:34.875829', '2026-09-16 00:06:57.840948', '2026-09-15 14:53:34.874874', '2026-09-15 14:53:58.931140', NULL, 'DEM-20260915-AF5058F2', 'PAYEE', 7, NULL),
(8, 'EN_LIGNE', '2026-09-16 00:14:39.655852', '2026-09-16 00:17:30.345804', '2026-09-16 00:14:39.655147', '2026-09-16 00:15:02.938916', NULL, 'DEM-20260916-9086D4AF', 'PAYEE', 8, NULL),
(9, 'EN_LIGNE', '2026-09-16 00:15:10.340669', '2026-09-16 00:15:10.340669', '2026-09-16 00:15:10.340403', NULL, NULL, 'DEM-20260916-A0A929B1', 'SOUMISE', 8, NULL),
(10, 'EN_LIGNE', '2026-09-16 00:23:09.028887', '2026-09-16 00:26:36.566407', '2026-09-16 00:23:09.028646', '2026-09-16 00:23:54.446453', NULL, 'DEM-20260916-50339768', 'PAYEE', 10, NULL),
(11, 'EN_LIGNE', '2026-09-16 11:17:47.008157', '2026-09-16 11:18:15.931510', '2026-09-16 11:17:47.007273', '2026-09-16 11:18:15.889417', NULL, 'DEM-20260916-6FC23DA4', 'EN_ATTENTE_PAIEMENT', 11, NULL),
(12, 'EN_LIGNE', '2026-09-16 12:57:09.543260', '2026-09-16 12:57:36.443413', '2026-09-16 12:57:09.542267', '2026-09-16 12:57:36.419335', NULL, 'DEM-20260916-4D55EEC8', 'EN_ATTENTE_PAIEMENT', 12, NULL),
(13, 'EN_LIGNE', '2026-09-16 13:12:53.352893', '2026-09-26 03:27:21.734912', '2026-09-16 13:12:53.351834', '2026-09-16 13:14:08.098343', NULL, 'DEM-20260916-D291A69E', 'PAYEE', 12, NULL),
(14, 'EN_LIGNE', '2026-09-16 14:18:17.203228', '2026-09-26 02:28:02.313359', '2026-09-16 14:18:17.202088', '2026-09-16 14:18:44.729002', NULL, 'DEM-20260916-CBA8A316', 'VALIDEE', 13, NULL),
(15, 'EN_LIGNE', '2026-09-16 15:42:44.618332', '2026-09-17 17:16:44.467467', '2026-09-16 15:42:44.617580', '2026-09-16 15:43:10.161594', NULL, 'DEM-20260916-278DE860', 'VALIDEE', 14, NULL),
(16, 'EN_LIGNE', '2026-09-16 16:00:59.663935', '2026-09-16 16:00:59.663935', '2026-09-16 16:00:59.663307', NULL, NULL, 'DEM-20260916-46CF8EAD', 'SOUMISE', 15, NULL),
(17, 'EN_LIGNE', '2026-09-16 16:05:05.923773', '2026-09-17 16:58:16.347115', '2026-09-16 16:05:05.923449', '2026-09-16 16:05:35.033345', 'La copie de la carte grise est illisible. Merci de déposer un document lisible.', 'DEM-20260916-2F1EEA87', 'EN_ATTENTE_CORRECTION', 15, NULL),
(18, 'EN_LIGNE', '2026-09-19 15:11:16.081155', '2026-09-19 15:15:02.619023', '2026-09-19 15:11:16.080288', '2026-09-19 15:12:04.022047', NULL, 'DEM-20260919-041C9C2D', 'VALIDEE', 16, NULL),
(19, 'EN_LIGNE', '2026-09-19 17:55:48.871459', '2026-09-19 17:55:48.871459', '2026-09-19 17:55:48.870183', NULL, NULL, 'DEM-20260919-7274E555', 'SOUMISE', 17, NULL),
(20, 'EN_LIGNE', '2026-09-19 17:56:38.649220', '2026-09-19 17:56:38.649220', '2026-09-19 17:56:38.648854', NULL, NULL, 'DEM-20260919-E23A4123', 'SOUMISE', 17, NULL),
(21, 'EN_LIGNE', '2026-09-19 17:57:53.074213', '2026-09-19 18:04:54.258461', '2026-09-19 17:57:53.074018', '2026-09-19 17:58:17.713613', NULL, 'DEM-20260919-C92DF29F', 'VALIDEE', 17, NULL),
(22, 'EN_LIGNE', '2026-09-21 00:02:37.368204', '2026-09-21 20:41:18.613210', '2026-09-21 00:02:37.366150', '2026-09-21 13:38:38.695273', NULL, 'DEM-REN-20260921-07EDC365', 'VALIDEE', 14, NULL),
(23, 'EN_LIGNE', '2026-09-21 23:33:33.261367', '2026-09-22 09:13:43.000000', '2026-09-21 23:33:33.258421', NULL, NULL, 'DEM-REN-20260921-C9A349D0', 'ANNULEE', 17, NULL),
(24, 'EN_LIGNE', '2026-09-22 09:14:58.257847', '2026-09-22 09:30:50.366805', '2026-09-22 09:14:58.252540', '2026-09-22 09:15:19.352966', NULL, 'DEM-REN-20260922-81C70E45', 'VALIDEE', 17, NULL),
(25, 'EN_LIGNE', '2026-09-22 15:20:44.566040', '2026-09-22 15:20:44.566040', '2026-09-22 15:20:44.562652', NULL, NULL, 'DEM-REN-20260922-91F713E7', 'SOUMISE', 17, NULL),
(26, 'EN_LIGNE', '2026-09-22 16:06:36.000000', '2026-09-22 16:47:18.829219', '2026-09-22 16:06:36.000000', '2026-09-22 16:06:36.000000', NULL, 'DEM-HIST-MEDUSE', 'ANNULEE', 18, NULL),
(27, 'EN_LIGNE', '2026-09-22 16:06:36.000000', '2026-09-22 16:47:18.829219', '2026-09-22 16:06:36.000000', '2026-09-22 16:06:36.000000', NULL, 'DEM-HIST-THOR', 'ANNULEE', 19, NULL),
(28, 'EN_LIGNE', '2026-09-22 16:06:36.000000', '2026-09-22 16:47:18.829219', '2026-09-22 16:06:36.000000', '2026-09-22 16:06:36.000000', NULL, 'DEM-HIST-ZEUS', 'ANNULEE', 20, NULL),
(29, 'EN_LIGNE', '2026-09-22 16:15:29.150610', '2026-09-22 16:30:55.393958', '2026-09-22 16:15:29.149654', '2026-09-22 16:15:45.286177', NULL, 'DEM-REN-20260922-145DE574', 'VALIDEE', 18, NULL),
(30, 'EN_LIGNE', '2026-09-22 16:23:25.412308', '2026-09-22 16:47:18.829219', '2026-09-22 16:23:25.412308', '2026-09-22 16:23:25.412308', NULL, 'DEM-INIT-MEDUSE', 'ANNULEE', 18, NULL),
(31, 'EN_LIGNE', '2026-07-23 10:00:00.000000', '2026-07-23 10:05:00.000000', '2026-07-23 10:00:00.000000', '2026-07-23 10:05:00.000000', NULL, 'DEM-INIT-THOR', 'ANNULEE', 19, NULL),
(32, 'EN_LIGNE', '2026-09-22 22:40:13.808505', '2026-09-22 22:42:35.801365', '2026-09-22 22:40:13.806461', '2026-09-22 22:40:30.628219', NULL, 'DEM-REN-20260922-6F031307', 'VALIDEE', 19, NULL),
(33, 'EN_LIGNE', '2026-09-22 22:49:29.668718', '2026-09-22 22:49:29.668718', '2026-09-22 22:49:29.668718', '2026-09-22 22:49:29.668718', NULL, 'DEM-INIT-ZEUS', 'ANNULEE', 20, NULL),
(34, 'EN_LIGNE', '2026-09-22 22:51:52.558972', '2026-09-22 22:53:21.609700', '2026-09-22 22:51:52.558608', '2026-09-22 22:52:02.852577', NULL, 'DEM-REN-20260922-196ADFD8', 'VALIDEE', 20, NULL),
(35, 'EN_LIGNE', '2026-09-23 10:31:47.809001', '2026-09-23 10:33:02.907253', '2026-09-23 10:31:47.806226', '2026-09-23 10:32:03.099689', NULL, 'DEM-REN-20260923-FF5F2518', 'VALIDEE', 20, NULL),
(36, 'EN_LIGNE', '2026-09-23 11:50:55.484193', '2026-09-23 11:50:55.484193', '2026-09-23 11:50:55.479314', NULL, NULL, 'DEM-REN-20260923-1CB42786', 'SOUMISE', 20, NULL),
(38, 'EN_LIGNE', '2026-09-24 13:01:05.361994', '2026-09-24 14:53:31.022822', '2026-09-24 13:01:05.361606', '2026-09-24 13:03:08.830255', NULL, 'DEM-CORP-20260924-47A7054A', 'VALIDEE', 22, NULL),
(39, 'EN_LIGNE', '2026-09-24 19:49:50.010220', '2026-09-25 00:42:37.775757', '2026-09-24 19:49:50.009197', '2026-09-24 19:50:05.494793', NULL, 'DEM-CORP-20260924-54A39F00', 'PRETE_A_FINALISER', 23, NULL),
(40, 'EN_LIGNE', '2026-09-25 09:37:10.114433', '2026-09-25 09:37:10.114433', '2026-09-25 09:37:10.113232', NULL, NULL, 'DEM-CORP-20260925-0875BCA0', 'SOUMISE', 24, NULL),
(41, 'EN_LIGNE', '2026-09-25 09:37:46.326882', '2026-09-25 09:45:29.533561', '2026-09-25 09:37:46.326743', '2026-09-25 09:38:00.337478', NULL, 'DEM-CORP-20260925-0E828AE0', 'FINALISEE', 24, NULL),
(51, 'EN_LIGNE', '2026-09-25 15:02:51.898833', '2026-09-25 15:10:39.922972', '2026-09-25 15:02:51.898011', '2026-09-25 15:03:26.168629', NULL, 'DEM-20260925-C05C7CF1', 'VALIDEE', 12, NULL),
(52, 'EN_LIGNE', '2026-09-26 00:38:35.544865', '2026-09-26 00:38:35.544865', '2026-09-26 00:38:35.538719', NULL, NULL, 'DEM-CORP-20260926-E8AD167A', 'SOUMISE', 23, NULL),
(53, 'EN_LIGNE', '2026-09-26 00:38:55.830386', '2026-09-26 00:45:33.605013', '2026-09-26 00:38:55.830296', '2026-09-26 00:39:10.566358', NULL, 'DEM-CORP-20260926-4F8DA04F', 'FINALISEE', 23, NULL),
(54, 'ASSISTE_PAR_AGENT', '2026-09-26 02:09:25.797494', '2026-09-26 02:10:17.394041', '2026-09-26 02:09:25.796896', '2026-09-26 02:09:44.025249', NULL, 'DEM-20260926-CAC4A2F6', 'PAYEE', 25, 3),
(55, 'ASSISTE_PAR_AGENT', '2026-09-26 02:46:32.391938', '2026-09-26 02:47:39.077748', '2026-09-26 02:46:32.391338', '2026-09-26 02:47:02.792971', NULL, 'DEM-20260926-185C3C3F', 'PAYEE', 26, 3),
(56, 'EN_LIGNE', '2026-09-27 08:06:13.000000', '2026-09-27 10:06:13.000000', '2026-09-27 08:06:13.000000', '2026-09-27 08:06:13.000000', NULL, 'DEM-20260927-CHEL01', 'EN_ATTENTE_PAIEMENT', 27, NULL),
(57, 'EN_LIGNE', '2026-09-27 05:06:13.000000', '2026-09-27 10:06:13.000000', '2026-09-27 05:06:13.000000', '2026-09-27 05:06:13.000000', NULL, 'DEM-20260927-CHEL02', 'EN_ATTENTE_PAIEMENT', 28, NULL),
(58, 'EN_LIGNE', '2026-09-26 10:06:13.000000', '2026-09-27 10:06:13.000000', '2026-09-26 10:06:13.000000', '2026-09-26 10:06:13.000000', NULL, 'DEM-20260927-CHEL03', 'EN_ATTENTE_PAIEMENT', 29, NULL),
(59, 'EN_LIGNE', '2026-09-25 06:06:13.000000', '2026-09-27 10:06:53.110074', '2026-09-25 06:06:13.000000', '2026-09-25 06:06:13.000000', NULL, 'DEM-20260927-CHEL04', 'PAYEE', 30, NULL),
(60, 'ASSISTE_PAR_AGENT', '2026-09-27 09:36:13.000000', '2026-09-27 10:06:13.000000', '2026-09-27 09:36:13.000000', '2026-09-27 09:36:13.000000', NULL, 'DEM-20260927-CHEL05', 'EN_ATTENTE_PAIEMENT', 31, 7),
(61, 'EN_LIGNE', '2026-09-27 09:51:13.000000', '2026-09-27 10:06:13.000000', '2026-09-27 09:51:13.000000', NULL, NULL, 'DEM-20260927-CHEL06', 'SOUMISE', 32, NULL),
(62, 'EN_LIGNE', '2026-09-27 08:17:24.000000', '2026-09-27 11:17:24.000000', '2026-09-27 08:17:24.000000', '2026-09-27 08:17:24.000000', NULL, 'DEM-20260927-HAD01', 'EN_ATTENTE_PAIEMENT', 33, NULL),
(63, 'EN_LIGNE', '2026-09-27 05:17:24.000000', '2026-09-27 11:17:24.000000', '2026-09-27 05:17:24.000000', '2026-09-27 05:17:24.000000', NULL, 'DEM-20260927-HAD02', 'EN_ATTENTE_PAIEMENT', 34, NULL),
(64, 'EN_LIGNE', '2026-09-27 10:17:24.000000', '2026-09-27 11:17:24.000000', '2026-09-27 10:17:24.000000', '2026-09-27 10:17:24.000000', NULL, 'DEM-20260927-THEA01', 'EN_ATTENTE_PAIEMENT', 35, NULL),
(65, 'EN_LIGNE', '2026-09-27 10:32:24.000000', '2026-09-27 11:17:24.000000', '2026-09-27 10:32:24.000000', NULL, NULL, 'DEM-20260927-THEA02', 'SOUMISE', 36, NULL),
(66, 'EN_LIGNE', '2026-09-27 03:17:24.000000', '2026-09-27 11:17:24.000000', '2026-09-27 03:17:24.000000', '2026-09-27 03:17:24.000000', NULL, 'DEM-20260927-BADR01', 'EN_ATTENTE_PAIEMENT', 37, NULL),
(67, 'EN_LIGNE', '2026-09-26 23:17:24.000000', '2026-09-27 11:17:24.000000', '2026-09-26 23:17:24.000000', '2026-09-26 23:17:24.000000', NULL, 'DEM-20260927-BADR02', 'EN_ATTENTE_PAIEMENT', 38, NULL),
(68, 'EN_LIGNE', '2026-09-27 07:17:24.000000', '2026-09-27 11:17:24.000000', '2026-09-27 07:17:24.000000', '2026-09-27 07:17:24.000000', NULL, 'DEM-20260927-RABIA01', 'EN_ATTENTE_PAIEMENT', 39, NULL),
(69, 'EN_LIGNE', '2026-09-25 11:17:24.000000', '2026-09-27 11:17:24.000000', '2026-09-25 11:17:24.000000', '2026-09-25 11:17:24.000000', NULL, 'DEM-20260927-FES01', 'EN_ATTENTE_PAIEMENT', 40, NULL),
(70, 'EN_LIGNE', '2026-09-26 11:17:24.000000', '2026-09-27 11:17:24.000000', '2026-09-26 11:17:24.000000', '2026-09-26 11:17:24.000000', NULL, 'DEM-20260927-RUSSIE01', 'EN_ATTENTE_PAIEMENT', 41, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `demande_corporate_immatriculation`
--

CREATE TABLE `demande_corporate_immatriculation` (
  `demande_id` bigint NOT NULL,
  `immatriculation` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `demande_corporate_immatriculation`
--

INSERT INTO `demande_corporate_immatriculation` (`demande_id`, `immatriculation`) VALUES
(38, '12345-A-1'),
(38, '67890-B-2'),
(39, '12345-A-1'),
(39, '67890-B-2'),
(40, '11111-A-1'),
(40, '22222-B-2'),
(41, '11111-A-1'),
(41, '22222-B-2'),
(52, '12345-A-1'),
(52, '67890-B-2'),
(53, '12345-A-1'),
(53, '67890-B-2');

-- --------------------------------------------------------

--
-- Table structure for table `demande_corporate_vehicule`
--

CREATE TABLE `demande_corporate_vehicule` (
  `demande_id` bigint NOT NULL,
  `vehicule_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `demande_nouveau_contrat_corporate`
--

CREATE TABLE `demande_nouveau_contrat_corporate` (
  `id` bigint NOT NULL,
  `contrat_genere_id` bigint DEFAULT NULL,
  `tarif_parking_id` bigint DEFAULT NULL,
  `adresse_projet` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `frais_cartes_ttc` decimal(15,2) NOT NULL,
  `libelle_projet` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant_abonnement_ttc` decimal(15,2) NOT NULL,
  `montant_total_ttc` decimal(15,2) NOT NULL,
  `nombre_places` int NOT NULL,
  `prix_mensuel_unitaire_ttc` decimal(12,2) NOT NULL,
  `titre_foncier` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parking_id` bigint NOT NULL,
  `cin_representant` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plage_horaire` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_convocation` datetime(6) DEFAULT NULL,
  `date_activation_cartes` datetime(6) DEFAULT NULL,
  `date_facturation` datetime(6) DEFAULT NULL,
  `date_finalisation` datetime(6) DEFAULT NULL,
  `date_paiement_et_remise_contrat` datetime(6) DEFAULT NULL,
  `date_retour_contrat_legalise` datetime(6) DEFAULT NULL,
  `abonnement_genere_id` bigint DEFAULT NULL,
  `facture_generee_id` bigint DEFAULT NULL,
  `paiement_corporate_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `demande_nouveau_contrat_corporate`
--

INSERT INTO `demande_nouveau_contrat_corporate` (`id`, `contrat_genere_id`, `tarif_parking_id`, `adresse_projet`, `frais_cartes_ttc`, `libelle_projet`, `montant_abonnement_ttc`, `montant_total_ttc`, `nombre_places`, `prix_mensuel_unitaire_ttc`, `titre_foncier`, `parking_id`, `cin_representant`, `plage_horaire`, `date_convocation`, `date_activation_cartes`, `date_facturation`, `date_finalisation`, `date_paiement_et_remise_contrat`, `date_retour_contrat_legalise`, `abonnement_genere_id`, `facture_generee_id`, `paiement_corporate_id`) VALUES
(38, 1, NULL, 'Bab Chellah, Rabat', 150.00, 'Projet corporate RRM', 270000.00, 270150.00, 3, 375.00, 'TF-12345/2026', 8, 'AB123456', 'Tous les jours de 08h00 à 20h00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, 2, NULL, 'boulevard Abdelkrim El Khattabi rue oslo apt 1', 100.00, 'Hotel Khouribga is the best', 180000.00, 180100.00, 2, 375.00, 'TF-12345/2026', 8, 'AB123456', 'Tous les jours de 08h00 à 20h00', '2026-09-24 22:37:48.733364', '2026-09-25 00:42:37.760089', '2026-09-25 00:40:51.775516', NULL, '2026-09-25 00:40:41.465670', '2026-09-25 00:40:48.255770', 7, 9, 15),
(40, NULL, NULL, 'boulevard Abdelkrim El Khattabi rue oslo apt 1', 150.00, 'Projet corporate Atlas', 270000.00, 270150.00, 3, 375.00, 'TF-25092026-01', 8, 'AB250926', 'Tous les jours de 08h00 à 20h00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, 3, NULL, 'boulevard Abdelkrim El Khattabi rue oslo apt 1', 150.00, 'Projet corporate Atlas', 270000.00, 270150.00, 3, 375.00, 'TF-25092026-01', 8, 'AB250926', 'Tous les jours de 08h00 à 20h00', '2026-09-25 09:40:31.030527', '2026-09-25 09:44:31.029164', '2026-09-25 09:42:23.351593', '2026-09-25 09:45:29.517339', '2026-09-25 09:41:30.502757', '2026-09-25 09:42:12.990815', 8, 10, 16),
(52, NULL, NULL, 'Avenue Annakhil, Rabat', 200.00, 'Projet corporate RRM', 360000.00, 360200.00, 4, 375.00, 'TF-12345/2026', 15, 'AB123456', 'Tous les jours de 08h00 à 20h00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, 4, NULL, 'Avenue Annakhil, Rabat', 200.00, 'Projet corporate RRM', 360000.00, 360200.00, 4, 375.00, 'TF-12345/2026', 15, 'AB123456', 'Tous les jours de 08h00 à 20h00', '2026-09-26 00:41:13.023535', '2026-09-26 00:44:43.414790', '2026-09-26 00:42:55.133346', '2026-09-26 00:45:33.593593', '2026-09-26 00:42:30.392402', '2026-09-26 00:42:48.750699', 10, 12, 20);

-- --------------------------------------------------------

--
-- Table structure for table `demande_nouvel_abonnement_regulier`
--

CREATE TABLE `demande_nouvel_abonnement_regulier` (
  `mode_paiement_souhaite` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id` bigint NOT NULL,
  `abonnement_genere_id` bigint DEFAULT NULL,
  `tarif_parking_id` bigint NOT NULL,
  `vehicule_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `demande_nouvel_abonnement_regulier`
--

INSERT INTO `demande_nouvel_abonnement_regulier` (`mode_paiement_souhaite`, `id`, `abonnement_genere_id`, `tarif_parking_id`, `vehicule_id`) VALUES
('ESPECE', 3, NULL, 29, 3),
('ESPECE', 4, NULL, 29, 4),
('ESPECE', 5, NULL, 29, 5),
('ESPECE', 6, NULL, 17, 6),
('ESPECE', 7, NULL, 23, 7),
('CHEQUE', 8, NULL, 79, 8),
('CHEQUE', 9, NULL, 79, 8),
('CHEQUE', 10, NULL, 121, 9),
('ESPECE', 11, NULL, 22, 10),
('CHEQUE', 12, NULL, 21, 11),
('CHEQUE', 13, NULL, 170, 12),
('CHEQUE', 14, 11, 377, 13),
('CHEQUE', 15, 1, 277, 14),
('CHEQUE', 16, NULL, 277, 15),
('CHEQUE', 17, NULL, 277, 15),
('CHEQUE', 18, 2, 309, 16),
('CHEQUE', 19, NULL, 283, 17),
('CHEQUE', 20, NULL, 283, 17),
('CHEQUE', 21, 3, 283, 17),
('ESPECE', 30, 4, 369, 18),
('ESPECE', 31, 5, 205, 19),
('ESPECE', 33, 6, 453, 20),
('CHEQUE', 51, 9, 189, 30),
('CHEQUE', 54, NULL, 350, 31),
('CHEQUE', 55, NULL, 174, 32),
('ESPECE', 56, NULL, 29, 33),
('ESPECE', 57, NULL, 29, 34),
('CHEQUE', 58, NULL, 29, 35),
('ESPECE', 59, NULL, 29, 36),
('ESPECE', 60, NULL, 29, 37),
('ESPECE', 61, NULL, 29, 38),
('ESPECE', 62, NULL, 1, 39),
('CHEQUE', 63, NULL, 1, 40),
('ESPECE', 64, NULL, 121, 41),
('ESPECE', 65, NULL, 121, 42),
('ESPECE', 66, NULL, 221, 43),
('ESPECE', 67, NULL, 221, 44),
('CHEQUE', 68, NULL, 397, 45),
('ESPECE', 69, NULL, 125, 46),
('ESPECE', 70, NULL, 57, 47);

-- --------------------------------------------------------

--
-- Table structure for table `demande_operationnelle`
--

CREATE TABLE `demande_operationnelle` (
  `id` bigint NOT NULL,
  `date_affectation` datetime(6) DEFAULT NULL,
  `date_annulation` datetime(6) DEFAULT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_execution` datetime(6) DEFAULT NULL,
  `date_prise_en_charge` datetime(6) DEFAULT NULL,
  `date_rejet` datetime(6) DEFAULT NULL,
  `motif` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motif_rejet` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resultat_execution` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('AFFECTEE','ANNULEE','CREEE','ECHEC','EN_COURS','REFUSEE','TERMINEE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_operation` enum('ACTIVATION','DESACTIVATION','IMPRESSION','REMISE','SUSPENSION') COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` bigint NOT NULL,
  `affectee_a_utilisateur_id` bigint DEFAULT NULL,
  `carte_acces_id` bigint NOT NULL,
  `creee_par_utilisateur_id` bigint NOT NULL,
  `demande_declencheuse_id` bigint DEFAULT NULL,
  `executee_par_utilisateur_id` bigint DEFAULT NULL,
  `demande_client_source_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `demande_operationnelle`
--

INSERT INTO `demande_operationnelle` (`id`, `date_affectation`, `date_annulation`, `date_creation`, `date_execution`, `date_prise_en_charge`, `date_rejet`, `motif`, `motif_rejet`, `reference`, `resultat_execution`, `statut`, `type_operation`, `version`, `affectee_a_utilisateur_id`, `carte_acces_id`, `creee_par_utilisateur_id`, `demande_declencheuse_id`, `executee_par_utilisateur_id`, `demande_client_source_id`) VALUES
(1, '2026-09-19 16:17:39.696563', NULL, '2026-09-17 17:16:44.460918', '2026-09-19 16:17:39.698817', '2026-09-19 16:17:39.696581', NULL, 'Impression de la première carte d\'accès', NULL, 'IMP-20260917-637AA2AF', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 1, 4, NULL, 3, NULL),
(2, NULL, NULL, '2026-09-19 15:15:02.612132', NULL, NULL, NULL, 'Impression de la première carte d\'accès', NULL, 'IMP-20260919-857E09B4', NULL, 'CREEE', 'IMPRESSION', 0, NULL, 2, 4, NULL, NULL, NULL),
(3, '2026-09-19 16:18:38.570778', NULL, '2026-09-19 16:17:39.731397', '2026-09-19 16:18:38.570927', '2026-09-19 16:18:38.570782', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260919-70FD34C4', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 1, 3, 1, 4, NULL),
(4, '2026-09-19 17:17:24.203662', NULL, '2026-09-19 17:16:36.841709', '2026-09-19 17:17:24.205713', '2026-09-19 17:17:24.203674', NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260919-47D1D889', 'Carte remise au client', 'TERMINEE', 'REMISE', 1, 3, 1, 4, 3, 3, NULL),
(5, '2026-09-19 18:17:31.161782', NULL, '2026-09-19 18:04:54.252007', '2026-09-19 18:17:31.163487', '2026-09-19 18:17:31.161788', NULL, 'Impression de la première carte d\'accès', NULL, 'IMP-20260919-0B95242B', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 3, 4, NULL, 3, NULL),
(6, '2026-09-19 18:18:03.264118', NULL, '2026-09-19 18:17:31.170737', '2026-09-19 18:18:03.264250', '2026-09-19 18:18:03.264122', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260919-47240D47', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 3, 3, 5, 4, NULL),
(7, NULL, NULL, '2026-09-19 18:18:03.270128', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260919-131BD0FF', NULL, 'CREEE', 'REMISE', 0, NULL, 3, 4, 6, NULL, NULL),
(8, '2026-09-21 20:41:37.038200', NULL, '2026-09-21 20:41:18.603941', '2026-09-21 20:41:37.038506', '2026-09-21 20:41:37.038225', NULL, 'Réactivation et test de la carte après renouvellement ; changement de forfait', NULL, 'ACT-20260921-C1FF1E2C', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 1, 4, NULL, 4, 22),
(9, NULL, NULL, '2026-09-22 09:43:43.615546', NULL, NULL, NULL, 'Réactivation et test de la carte après renouvellement', NULL, 'ACT-20260922-19870173', NULL, 'CREEE', 'ACTIVATION', 0, NULL, 3, 4, NULL, NULL, 24),
(10, '2026-09-22 16:49:24.071409', NULL, '2026-09-22 16:30:55.319546', '2026-09-22 16:49:24.072482', '2026-09-22 16:49:24.071439', NULL, 'Réactivation et test de la carte après renouvellement', NULL, 'ACT-20260922-E93A0C00', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 4, 4, NULL, 4, 29),
(11, NULL, NULL, '2026-09-22 22:31:50.121563', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260922-BC24ACF9', NULL, 'CREEE', 'REMISE', 0, NULL, 4, 4, 10, NULL, NULL),
(12, '2026-09-22 22:44:23.536832', NULL, '2026-09-22 22:42:35.798258', '2026-09-22 22:44:23.536970', '2026-09-22 22:44:23.536845', NULL, 'Réactivation et test de la carte après renouvellement ; changement de parking ; changement de forfait', NULL, 'ACT-20260922-336AF811', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 5, 4, NULL, 4, 32),
(13, '2026-09-22 22:54:22.433173', NULL, '2026-09-22 22:53:21.606595', '2026-09-22 22:54:22.433200', '2026-09-22 22:54:22.433181', NULL, 'Réactivation et test de la carte après renouvellement ; carte expirée ; changement de forfait', NULL, 'ACT-20260922-796E3883', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 6, 5, NULL, 4, 34),
(14, '2026-09-23 10:33:28.775382', NULL, '2026-09-23 10:33:02.901109', '2026-09-23 10:33:28.775435', '2026-09-23 10:33:28.775390', NULL, 'Réactivation et test de la carte après renouvellement', NULL, 'ACT-20260923-AB2729FC', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 6, 5, NULL, 4, 35),
(15, NULL, NULL, '2026-09-23 15:10:58.694412', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260923-A753439B', NULL, 'CREEE', 'REMISE', 0, NULL, 5, 4, 12, NULL, NULL),
(16, NULL, NULL, '2026-09-23 15:10:58.739718', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260923-CBBE7488', NULL, 'CREEE', 'REMISE', 0, NULL, 6, 4, 13, NULL, NULL),
(17, '2026-09-25 00:42:01.624612', NULL, '2026-09-25 00:40:51.741072', '2026-09-25 00:42:01.625956', '2026-09-25 00:42:01.624620', NULL, 'Impression de la carte corporate 1/2', NULL, 'IMP-20260925-3B867FA9', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 7, 5, NULL, 3, 39),
(18, '2026-09-25 00:41:56.314627', NULL, '2026-09-25 00:40:51.772044', '2026-09-25 00:41:56.316036', '2026-09-25 00:41:56.314647', NULL, 'Impression de la carte corporate 2/2', NULL, 'IMP-20260925-5245D71F', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 8, 5, NULL, 3, 39),
(19, '2026-09-25 00:42:37.760057', NULL, '2026-09-25 00:41:56.329108', '2026-09-25 00:42:37.760091', '2026-09-25 00:42:37.760066', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260925-4AFC2A9B', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 8, 3, 18, 4, 39),
(20, '2026-09-25 00:42:35.640342', NULL, '2026-09-25 00:42:01.631445', '2026-09-25 00:42:35.640460', '2026-09-25 00:42:35.640347', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260925-0C8D2EDA', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 7, 3, 17, 4, 39),
(21, NULL, NULL, '2026-09-25 09:31:50.963033', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260925-F2434405', NULL, 'CREEE', 'REMISE', 0, NULL, 8, 4, 19, NULL, NULL),
(22, NULL, NULL, '2026-09-25 09:31:51.001433', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260925-4FFF1E5C', NULL, 'CREEE', 'REMISE', 0, NULL, 7, 4, 20, NULL, NULL),
(23, '2026-09-25 09:44:11.568388', NULL, '2026-09-25 09:42:23.314503', '2026-09-25 09:44:11.569358', '2026-09-25 09:44:11.568394', NULL, 'Impression de la carte corporate 1/3', NULL, 'IMP-20260925-DFA4848A', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 9, 5, NULL, 3, 41),
(24, '2026-09-25 09:44:05.045809', NULL, '2026-09-25 09:42:23.334588', '2026-09-25 09:44:05.047313', '2026-09-25 09:44:05.045813', NULL, 'Impression de la carte corporate 2/3', NULL, 'IMP-20260925-904CDE38', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 10, 5, NULL, 3, 41),
(25, '2026-09-25 09:43:53.919238', NULL, '2026-09-25 09:42:23.348829', '2026-09-25 09:43:53.920600', '2026-09-25 09:43:53.919245', NULL, 'Impression de la carte corporate 3/3', NULL, 'IMP-20260925-B793B141', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 11, 5, NULL, 3, 41),
(26, '2026-09-25 09:44:31.029137', NULL, '2026-09-25 09:43:53.929304', '2026-09-25 09:44:31.029166', '2026-09-25 09:44:31.029150', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260925-DA2047D1', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 11, 3, 25, 4, 41),
(27, '2026-09-25 09:44:29.057236', NULL, '2026-09-25 09:44:05.053919', '2026-09-25 09:44:29.057263', '2026-09-25 09:44:29.057246', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260925-EEC8B922', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 10, 3, 24, 4, 41),
(28, '2026-09-25 09:44:27.000213', NULL, '2026-09-25 09:44:11.577387', '2026-09-25 09:44:27.000320', '2026-09-25 09:44:27.000217', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260925-969CC013', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 9, 3, 23, 4, 41),
(29, NULL, NULL, '2026-09-25 11:10:09.506604', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260925-A61AC921', NULL, 'CREEE', 'REMISE', 0, NULL, 11, 4, 26, NULL, NULL),
(30, NULL, NULL, '2026-09-25 11:10:09.528420', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260925-D45AFF79', NULL, 'CREEE', 'REMISE', 0, NULL, 10, 4, 27, NULL, NULL),
(31, NULL, NULL, '2026-09-25 11:10:09.536176', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260925-083EC4A8', NULL, 'CREEE', 'REMISE', 0, NULL, 9, 4, 28, NULL, NULL),
(32, '2026-09-25 15:12:04.204446', NULL, '2026-09-25 15:10:39.917849', '2026-09-25 15:12:04.205443', '2026-09-25 15:12:04.204452', NULL, 'Impression de la première carte d\'accès', NULL, 'IMP-20260925-86061F17', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 12, 5, NULL, 3, 51),
(33, '2026-09-25 15:12:23.355838', NULL, '2026-09-25 15:12:04.210014', '2026-09-25 15:12:23.355935', '2026-09-25 15:12:23.355847', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260925-D1024ED6', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 12, 3, 32, 4, 51),
(34, NULL, NULL, '2026-09-25 15:12:23.360014', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260925-96E2B1F5', NULL, 'CREEE', 'REMISE', 0, NULL, 12, 4, 33, NULL, 51),
(35, '2026-09-26 00:44:01.593123', NULL, '2026-09-26 00:42:55.079985', '2026-09-26 00:44:01.594250', '2026-09-26 00:44:01.593131', NULL, 'Impression de la carte corporate 1/4', NULL, 'IMP-20260926-55BE10E6', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 13, 5, NULL, 3, 53),
(36, '2026-09-26 00:44:20.693495', NULL, '2026-09-26 00:42:55.108213', '2026-09-26 00:44:20.694961', '2026-09-26 00:44:20.693504', NULL, 'Impression de la carte corporate 2/4', NULL, 'IMP-20260926-80E6CB0F', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 14, 5, NULL, 3, 53),
(37, '2026-09-26 00:44:09.470491', NULL, '2026-09-26 00:42:55.120123', '2026-09-26 00:44:09.471758', '2026-09-26 00:44:09.470498', NULL, 'Impression de la carte corporate 3/4', NULL, 'IMP-20260926-C6CFCAF3', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 15, 5, NULL, 3, 53),
(38, '2026-09-26 00:44:14.734332', NULL, '2026-09-26 00:42:55.130440', '2026-09-26 00:44:14.735199', '2026-09-26 00:44:14.734356', NULL, 'Impression de la carte corporate 4/4', NULL, 'IMP-20260926-AF147B03', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 16, 5, NULL, 3, 53),
(39, '2026-09-26 00:44:43.414737', NULL, '2026-09-26 00:44:01.600628', '2026-09-26 00:44:43.414794', '2026-09-26 00:44:43.414760', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260926-5AF8D177', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 13, 3, 35, 4, 53),
(40, '2026-09-26 00:44:41.860551', NULL, '2026-09-26 00:44:09.476210', '2026-09-26 00:44:41.860566', '2026-09-26 00:44:41.860554', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260926-65AEE9C7', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 15, 3, 37, 4, 53),
(41, '2026-09-26 00:44:40.206277', NULL, '2026-09-26 00:44:14.746253', '2026-09-26 00:44:40.206294', '2026-09-26 00:44:40.206282', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260926-D7812923', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 16, 3, 38, 4, 53),
(42, '2026-09-26 00:44:38.457697', NULL, '2026-09-26 00:44:20.701168', '2026-09-26 00:44:38.457873', '2026-09-26 00:44:38.457703', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260926-37B506D1', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 14, 3, 36, 4, 53),
(43, NULL, NULL, '2026-09-26 02:07:18.426236', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260926-06A060F2', NULL, 'CREEE', 'REMISE', 0, NULL, 13, 4, 39, NULL, NULL),
(44, NULL, NULL, '2026-09-26 02:07:18.519734', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260926-F7320B44', NULL, 'CREEE', 'REMISE', 0, NULL, 15, 4, 40, NULL, NULL),
(45, NULL, NULL, '2026-09-26 02:07:18.531464', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260926-F7B18145', NULL, 'CREEE', 'REMISE', 0, NULL, 16, 4, 41, NULL, NULL),
(46, NULL, NULL, '2026-09-26 02:07:18.542141', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260926-512A6A3C', NULL, 'CREEE', 'REMISE', 0, NULL, 14, 4, 42, NULL, NULL),
(47, '2026-09-26 02:31:48.870409', NULL, '2026-09-26 02:28:02.308252', '2026-09-26 02:31:48.871412', '2026-09-26 02:31:48.870417', NULL, 'Impression de la première carte d\'accès', NULL, 'IMP-20260926-8319BD3A', 'Carte imprimée avec succès', 'TERMINEE', 'IMPRESSION', 1, 3, 17, 5, NULL, 3, 14),
(48, '2026-09-26 02:32:09.248440', NULL, '2026-09-26 02:31:48.876932', '2026-09-26 02:32:09.248611', '2026-09-26 02:32:09.248486', NULL, 'Activation et test de la carte d\'accès', NULL, 'ACT-20260926-3E374E04', 'Carte activée avec succès', 'TERMINEE', 'ACTIVATION', 1, 4, 17, 3, 47, 4, 14),
(49, NULL, NULL, '2026-09-26 02:32:09.255384', NULL, NULL, NULL, 'Remise de la carte d\'accès au client', NULL, 'REM-20260926-C4A96337', NULL, 'CREEE', 'REMISE', 0, NULL, 17, 4, 48, NULL, 14);

-- --------------------------------------------------------

--
-- Table structure for table `demande_renouvellement_regulier`
--

CREATE TABLE `demande_renouvellement_regulier` (
  `id` bigint NOT NULL,
  `abonnement_concerne_id` bigint NOT NULL,
  `periode_generee_id` bigint DEFAULT NULL,
  `tarif_parking_id` bigint NOT NULL,
  `mode_paiement_souhaite` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `demande_renouvellement_regulier`
--

INSERT INTO `demande_renouvellement_regulier` (`id`, `abonnement_concerne_id`, `periode_generee_id`, `tarif_parking_id`, `mode_paiement_souhaite`) VALUES
(22, 1, 7, 281, 'ESPECE'),
(23, 3, NULL, 217, 'CHEQUE'),
(24, 3, 8, 281, 'CHEQUE'),
(25, 3, NULL, 281, 'ESPECE'),
(26, 4, 9, 369, 'ESPECE'),
(27, 5, 10, 205, 'ESPECE'),
(28, 6, 11, 453, 'ESPECE'),
(29, 4, 12, 369, 'ESPECE'),
(32, 5, 13, 286, 'ESPECE'),
(34, 6, 14, 457, 'CHEQUE'),
(35, 6, 15, 457, 'ESPECE'),
(36, 6, NULL, 277, 'ESPECE');

-- --------------------------------------------------------

--
-- Table structure for table `facture`
--

CREATE TABLE `facture` (
  `id` bigint NOT NULL,
  `date_annulation` datetime(6) DEFAULT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_emission` datetime(6) DEFAULT NULL,
  `motif_annulation` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ANNULEE','BROUILLON','EMISE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_ht` decimal(12,2) NOT NULL,
  `total_ttc` decimal(12,2) NOT NULL,
  `total_tva` decimal(12,2) NOT NULL,
  `paiement_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `facture`
--

INSERT INTO `facture` (`id`, `date_annulation`, `date_creation`, `date_emission`, `motif_annulation`, `numero`, `statut`, `total_ht`, `total_ttc`, `total_tva`, `paiement_id`) VALUES
(1, NULL, '2026-09-19 14:34:02.591041', '2026-09-19 14:34:02.593651', NULL, 'FACT-RRM-20260919-22BB3A04', 'EMISE', 916.67, 1100.00, 183.33, 6),
(2, NULL, '2026-09-19 15:16:03.933139', '2026-09-19 15:16:03.936795', NULL, 'FACT-RRM-20260919-D93F9AD3', 'EMISE', 2541.67, 3050.00, 508.33, 7),
(3, NULL, '2026-09-19 18:06:55.750259', '2026-09-19 18:06:55.753384', NULL, 'FACT-RRM-20260919-EA971DA9', 'EMISE', 3791.67, 4550.00, 758.33, 8),
(4, NULL, '2026-09-22 14:33:17.472126', '2026-09-22 14:33:17.482240', NULL, 'FACT-RRM-20260922-2DE57381', 'EMISE', 1250.00, 1500.00, 250.00, 10),
(5, NULL, '2026-09-22 16:47:59.663165', '2026-09-22 16:47:59.667089', NULL, 'FACT-RRM-20260922-F475B355', 'EMISE', 750.00, 900.00, 150.00, 11),
(6, NULL, '2026-09-22 22:43:53.070071', '2026-09-22 22:43:53.072729', NULL, 'FACT-RRM-20260922-39AE1F2C', 'EMISE', 1500.00, 1800.00, 300.00, 12),
(7, NULL, '2026-09-22 22:53:37.671632', '2026-09-22 22:53:37.672876', NULL, 'FACT-RRM-20260922-EF1FD10D', 'EMISE', 1750.00, 2100.00, 350.00, 13),
(8, NULL, '2026-09-23 10:33:05.368711', '2026-09-23 10:33:05.370772', NULL, 'FACT-RRM-20260923-26EF082E', 'EMISE', 1750.00, 2100.00, 350.00, 14),
(9, NULL, '2026-09-25 00:40:51.699597', '2026-09-25 00:40:51.700747', NULL, 'FACT-RRM-20260925-43B66AB9', 'EMISE', 150083.33, 180100.00, 30016.67, 15),
(10, NULL, '2026-09-25 09:42:23.286472', '2026-09-25 09:42:23.288623', NULL, 'FACT-RRM-20260925-41AF751E', 'EMISE', 225125.00, 270150.00, 45025.00, 16),
(11, NULL, '2026-09-25 15:10:53.840698', '2026-09-25 15:10:53.843955', NULL, 'FACT-RRM-20260925-031E45DF', 'EMISE', 1291.67, 1550.00, 258.33, 17),
(12, NULL, '2026-09-26 00:42:55.027335', '2026-09-26 00:42:55.028629', NULL, 'FACT-RRM-20260926-7952121C', 'EMISE', 300166.67, 360200.00, 60033.33, 20),
(13, NULL, '2026-09-26 02:28:07.801332', '2026-09-26 02:28:07.804403', NULL, 'FACT-RRM-20260926-8F9288F6', 'EMISE', 1166.67, 1400.00, 233.33, 18);

-- --------------------------------------------------------

--
-- Table structure for table `forfait`
--

CREATE TABLE `forfait` (
  `id` bigint NOT NULL,
  `actif` bit(1) NOT NULL,
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_modification` datetime(6) NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `libelle` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `place_reservee` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `forfait`
--

INSERT INTO `forfait` (`id`, `actif`, `code`, `date_creation`, `date_modification`, `description`, `libelle`, `place_reservee`) VALUES
(1, b'1', 'NUIT_5J_20H_08H', '2026-09-11 15:32:08.625860', '2026-09-11 15:32:08.625860', 'Nuit 5j/7 hors week-end 20h-08h', 'Nuit 5j/7 hors week-end 20h-08h', b'0'),
(2, b'1', 'NUIT_7J_20H_08H', '2026-09-11 15:32:08.836651', '2026-09-11 15:32:08.836651', 'Nuit 7j/7 20h-08h', 'Nuit 7j/7 20h-08h', b'0'),
(3, b'1', 'NUIT_5J_WE_24H', '2026-09-11 15:32:08.915406', '2026-09-11 15:32:08.915406', 'Nuit 5j/7 20h-08h et week-end 24h/24', 'Nuit 5j/7 20h-08h et week-end 24h/24', b'0'),
(4, b'1', 'JOUR_7J_08H_20H', '2026-09-11 15:32:09.004927', '2026-09-11 15:32:09.004927', 'Jour 7j/7 08h-20h', 'Jour 7j/7 08h-20h', b'0'),
(5, b'1', 'JOUR_7J_08H_22H', '2026-09-11 15:32:09.116530', '2026-09-11 15:32:09.116530', 'Jour 7j/7 08h-22h', 'Jour 7j/7 08h-22h', b'0'),
(6, b'1', 'H24_NON_RESERVEE', '2026-09-11 15:32:09.233764', '2026-09-11 15:32:09.233764', '24h/24 et 7j/7 place non réservée', '24h/24 et 7j/7 place non réservée', b'0'),
(7, b'1', 'H24_RESERVEE', '2026-09-11 15:32:09.338022', '2026-09-11 15:32:09.338022', '24h/24 et 7j/7 place réservée', '24h/24 et 7j/7 place réservée', b'1'),
(8, b'1', 'H24_7J_STANDARD', '2026-09-11 15:32:10.798650', '2026-09-11 15:32:10.798650', '24h/24 et 7j/7', '24h/24 et 7j/7', b'0'),
(9, b'1', 'RAHTI', '2026-09-11 15:32:10.965285', '2026-09-11 15:32:10.965285', 'Rahti - nuit 7j/7 18h-09h et week-end 24h/24', 'Rahti - nuit 7j/7 18h-09h et week-end 24h/24', b'0'),
(10, b'1', 'TAJIR', '2026-09-11 15:32:11.018315', '2026-09-11 15:32:11.018315', 'Tajir - jour 7j/7 08h-22h', 'Tajir - jour 7j/7 08h-22h', b'0');

-- --------------------------------------------------------

--
-- Table structure for table `historique_statut_demande`
--

CREATE TABLE `historique_statut_demande` (
  `id` bigint NOT NULL,
  `ancien_statut` enum('ANNULEE','EN_ATTENTE_CORRECTION','EN_ATTENTE_FACTURATION','EN_ATTENTE_PAIEMENT','EN_ATTENTE_PAIEMENT_SIGNATURE','EN_ATTENTE_RETOUR_CONTRAT_LEGALISE','EN_ATTENTE_VALIDATION_RESPONSABLE','EN_PREPARATION_CARTES','EXPIREE','FINALISEE','PAYEE','PRETE_A_FINALISER','REFUSEE','SOUMISE','VALIDEE') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_changement` datetime(6) NOT NULL,
  `motif` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nouveau_statut` enum('ANNULEE','EN_ATTENTE_CORRECTION','EN_ATTENTE_FACTURATION','EN_ATTENTE_PAIEMENT','EN_ATTENTE_PAIEMENT_SIGNATURE','EN_ATTENTE_RETOUR_CONTRAT_LEGALISE','EN_ATTENTE_VALIDATION_RESPONSABLE','EN_PREPARATION_CARTES','EXPIREE','FINALISEE','PAYEE','PRETE_A_FINALISER','REFUSEE','SOUMISE','VALIDEE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `origine` enum('CLIENT','SYSTEME','UTILISATEUR_INTERNE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `demande_id` bigint NOT NULL,
  `effectue_par_utilisateur_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `historique_statut_demande`
--

INSERT INTO `historique_statut_demande` (`id`, `ancien_statut`, `date_changement`, `motif`, `nouveau_statut`, `origine`, `demande_id`, `effectue_par_utilisateur_id`) VALUES
(3, NULL, '2026-09-12 16:54:42.074141', NULL, 'SOUMISE', 'CLIENT', 3, NULL),
(4, 'SOUMISE', '2026-09-12 16:55:01.426400', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 3, NULL),
(5, NULL, '2026-09-12 22:37:30.834256', NULL, 'SOUMISE', 'CLIENT', 4, NULL),
(6, 'SOUMISE', '2026-09-12 22:37:53.161563', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 4, NULL),
(7, NULL, '2026-09-13 11:28:54.998994', NULL, 'SOUMISE', 'CLIENT', 5, NULL),
(8, 'SOUMISE', '2026-09-13 11:29:13.671005', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 5, NULL),
(9, 'EN_ATTENTE_PAIEMENT', '2026-09-14 09:23:55.083760', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 4, 2),
(10, NULL, '2026-09-14 19:44:40.821732', NULL, 'SOUMISE', 'CLIENT', 6, NULL),
(11, 'SOUMISE', '2026-09-14 19:45:02.833191', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 6, NULL),
(12, NULL, '2026-09-15 14:53:34.874924', NULL, 'SOUMISE', 'CLIENT', 7, NULL),
(13, 'SOUMISE', '2026-09-15 14:53:58.931158', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 7, NULL),
(14, 'EN_ATTENTE_PAIEMENT', '2026-09-16 00:06:57.781643', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 7, 3),
(15, NULL, '2026-09-16 00:14:39.655178', NULL, 'SOUMISE', 'CLIENT', 8, NULL),
(16, 'SOUMISE', '2026-09-16 00:15:02.938935', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 8, NULL),
(17, NULL, '2026-09-16 00:15:10.340413', NULL, 'SOUMISE', 'CLIENT', 9, NULL),
(18, 'EN_ATTENTE_PAIEMENT', '2026-09-16 00:17:30.339842', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 8, 3),
(19, NULL, '2026-09-16 00:23:09.028652', NULL, 'SOUMISE', 'CLIENT', 10, NULL),
(20, 'SOUMISE', '2026-09-16 00:23:54.446457', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 10, NULL),
(21, 'EN_ATTENTE_PAIEMENT', '2026-09-16 00:26:36.561265', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 10, 3),
(22, NULL, '2026-09-16 11:17:47.007313', NULL, 'SOUMISE', 'CLIENT', 11, NULL),
(23, 'SOUMISE', '2026-09-16 11:18:15.889432', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 11, NULL),
(24, NULL, '2026-09-16 12:57:09.542331', NULL, 'SOUMISE', 'CLIENT', 12, NULL),
(25, 'SOUMISE', '2026-09-16 12:57:36.419359', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 12, NULL),
(26, NULL, '2026-09-16 13:12:53.351887', NULL, 'SOUMISE', 'CLIENT', 13, NULL),
(27, 'SOUMISE', '2026-09-16 13:14:08.098368', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 13, NULL),
(28, NULL, '2026-09-16 14:18:17.202125', NULL, 'SOUMISE', 'CLIENT', 14, NULL),
(29, 'SOUMISE', '2026-09-16 14:18:44.729026', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 14, NULL),
(30, NULL, '2026-09-16 15:42:44.617665', NULL, 'SOUMISE', 'CLIENT', 15, NULL),
(31, 'SOUMISE', '2026-09-16 15:43:10.161619', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 15, NULL),
(32, NULL, '2026-09-16 16:00:59.663341', NULL, 'SOUMISE', 'CLIENT', 16, NULL),
(33, NULL, '2026-09-16 16:05:05.923458', NULL, 'SOUMISE', 'CLIENT', 17, NULL),
(34, 'SOUMISE', '2026-09-16 16:05:35.033363', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 17, NULL),
(35, 'EN_ATTENTE_PAIEMENT', '2026-09-16 16:41:27.394908', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 17, 3),
(36, 'EN_ATTENTE_PAIEMENT', '2026-09-16 16:46:23.767596', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 15, 3),
(37, 'PAYEE', '2026-09-17 16:58:16.336858', 'La copie de la carte grise est illisible. Merci de déposer un document lisible.', 'EN_ATTENTE_CORRECTION', 'UTILISATEUR_INTERNE', 17, 4),
(38, 'PAYEE', '2026-09-17 17:16:44.397515', 'Validation finale du dossier payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 15, 4),
(39, NULL, '2026-09-19 15:11:16.080328', NULL, 'SOUMISE', 'CLIENT', 18, NULL),
(40, 'SOUMISE', '2026-09-19 15:12:04.022065', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 18, NULL),
(41, 'EN_ATTENTE_PAIEMENT', '2026-09-19 15:13:53.295487', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 18, 3),
(42, 'PAYEE', '2026-09-19 15:15:02.554269', 'Validation finale du dossier payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 18, 4),
(43, NULL, '2026-09-19 17:55:48.870282', NULL, 'SOUMISE', 'CLIENT', 19, NULL),
(44, NULL, '2026-09-19 17:56:38.648879', NULL, 'SOUMISE', 'CLIENT', 20, NULL),
(45, NULL, '2026-09-19 17:57:53.074026', NULL, 'SOUMISE', 'CLIENT', 21, NULL),
(46, 'SOUMISE', '2026-09-19 17:58:17.713634', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 21, NULL),
(47, 'EN_ATTENTE_PAIEMENT', '2026-09-19 18:02:27.156199', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 21, 3),
(48, 'PAYEE', '2026-09-19 18:04:54.200433', 'Validation finale du dossier payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 21, 4),
(49, NULL, '2026-09-21 00:02:37.366229', NULL, 'SOUMISE', 'CLIENT', 22, NULL),
(50, 'SOUMISE', '2026-09-21 13:38:38.695428', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 22, NULL),
(51, 'EN_ATTENTE_PAIEMENT', '2026-09-21 14:06:58.545914', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 22, 3),
(53, 'PAYEE', '2026-09-21 20:41:18.552515', 'Validation finale du renouvellement payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 22, 4),
(54, NULL, '2026-09-21 23:33:33.258480', NULL, 'SOUMISE', 'CLIENT', 23, NULL),
(55, NULL, '2026-09-22 09:14:58.252663', NULL, 'SOUMISE', 'CLIENT', 24, NULL),
(56, 'SOUMISE', '2026-09-22 09:15:19.353038', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 24, NULL),
(57, 'EN_ATTENTE_PAIEMENT', '2026-09-22 09:30:19.567011', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 24, 3),
(58, 'PAYEE', '2026-09-22 09:30:50.353161', 'Validation finale du renouvellement payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 24, 4),
(59, NULL, '2026-09-22 15:20:44.562799', NULL, 'SOUMISE', 'CLIENT', 25, NULL),
(60, NULL, '2026-09-22 16:15:29.149689', NULL, 'SOUMISE', 'CLIENT', 29, NULL),
(61, 'SOUMISE', '2026-09-22 16:15:45.286234', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 29, NULL),
(62, 'EN_ATTENTE_PAIEMENT', '2026-09-22 16:25:07.839942', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 29, 3),
(63, 'PAYEE', '2026-09-22 16:30:55.284375', 'Validation finale du renouvellement payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 29, 4),
(64, NULL, '2026-09-22 22:40:13.806514', NULL, 'SOUMISE', 'CLIENT', 32, NULL),
(65, 'SOUMISE', '2026-09-22 22:40:30.628284', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 32, NULL),
(66, 'EN_ATTENTE_PAIEMENT', '2026-09-22 22:42:11.900246', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 32, 3),
(67, 'PAYEE', '2026-09-22 22:42:35.783855', 'Validation finale du renouvellement payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 32, 4),
(68, NULL, '2026-09-22 22:51:52.558625', NULL, 'SOUMISE', 'CLIENT', 34, NULL),
(69, 'SOUMISE', '2026-09-22 22:52:02.852582', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 34, NULL),
(70, 'EN_ATTENTE_PAIEMENT', '2026-09-22 22:52:54.988716', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 34, 3),
(71, 'PAYEE', '2026-09-22 22:53:21.601256', 'Validation finale du renouvellement payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 34, 5),
(72, NULL, '2026-09-23 10:31:47.806251', NULL, 'SOUMISE', 'CLIENT', 35, NULL),
(73, 'SOUMISE', '2026-09-23 10:32:03.099694', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 35, NULL),
(74, 'EN_ATTENTE_PAIEMENT', '2026-09-23 10:32:44.680584', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 35, 3),
(75, 'PAYEE', '2026-09-23 10:33:02.890529', 'Validation finale du renouvellement payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 35, 5),
(76, NULL, '2026-09-23 11:50:55.479667', NULL, 'SOUMISE', 'CLIENT', 36, NULL),
(77, NULL, '2026-09-24 13:01:05.361613', NULL, 'SOUMISE', 'CLIENT', 38, NULL),
(78, 'SOUMISE', '2026-09-24 13:03:08.830269', 'Validation du code OTP corporate', 'EN_ATTENTE_VALIDATION_RESPONSABLE', 'CLIENT', 38, NULL),
(79, 'EN_ATTENTE_VALIDATION_RESPONSABLE', '2026-09-24 14:53:30.951097', 'Validation de la demande corporate par le responsable', 'VALIDEE', 'UTILISATEUR_INTERNE', 38, 5),
(80, NULL, '2026-09-24 19:49:50.009225', NULL, 'SOUMISE', 'CLIENT', 39, NULL),
(81, 'SOUMISE', '2026-09-24 19:50:05.494803', 'Validation du code OTP corporate', 'EN_ATTENTE_VALIDATION_RESPONSABLE', 'CLIENT', 39, NULL),
(82, 'EN_ATTENTE_VALIDATION_RESPONSABLE', '2026-09-24 19:51:19.652116', 'Validation de la demande corporate par le responsable', 'VALIDEE', 'UTILISATEUR_INTERNE', 39, 5),
(83, 'VALIDEE', '2026-09-24 22:37:48.733496', 'Convocation au siège pour paiement et signature', 'EN_ATTENTE_PAIEMENT_SIGNATURE', 'UTILISATEUR_INTERNE', 39, 5),
(84, 'EN_ATTENTE_PAIEMENT_SIGNATURE', '2026-09-25 00:40:41.465805', 'Paiement par chèque confirmé et contrat remis au client', 'EN_ATTENTE_RETOUR_CONTRAT_LEGALISE', 'UTILISATEUR_INTERNE', 39, 5),
(85, 'EN_ATTENTE_RETOUR_CONTRAT_LEGALISE', '2026-09-25 00:40:48.255791', 'Retour du contrat signé et légalisé déclaré', 'EN_ATTENTE_FACTURATION', 'UTILISATEUR_INTERNE', 39, 5),
(86, 'EN_ATTENTE_FACTURATION', '2026-09-25 00:40:51.775533', 'Facture émise et demandes d\'impression des cartes créées', 'EN_PREPARATION_CARTES', 'UTILISATEUR_INTERNE', 39, 5),
(87, 'EN_PREPARATION_CARTES', '2026-09-25 00:42:37.769686', 'Toutes les cartes sont activées et testées', 'PRETE_A_FINALISER', 'UTILISATEUR_INTERNE', 39, 4),
(88, NULL, '2026-09-25 09:37:10.113539', NULL, 'SOUMISE', 'CLIENT', 40, NULL),
(89, NULL, '2026-09-25 09:37:46.326749', NULL, 'SOUMISE', 'CLIENT', 41, NULL),
(90, 'SOUMISE', '2026-09-25 09:38:00.337501', 'Validation du code OTP corporate', 'EN_ATTENTE_VALIDATION_RESPONSABLE', 'CLIENT', 41, NULL),
(91, 'EN_ATTENTE_VALIDATION_RESPONSABLE', '2026-09-25 09:39:32.861046', 'Validation de la demande corporate par le responsable', 'VALIDEE', 'UTILISATEUR_INTERNE', 41, 5),
(92, 'VALIDEE', '2026-09-25 09:40:31.030663', 'Convocation au siège pour paiement et signature', 'EN_ATTENTE_PAIEMENT_SIGNATURE', 'UTILISATEUR_INTERNE', 41, 5),
(93, 'EN_ATTENTE_PAIEMENT_SIGNATURE', '2026-09-25 09:41:30.502771', 'Paiement par chèque confirmé et contrat remis au client', 'EN_ATTENTE_RETOUR_CONTRAT_LEGALISE', 'UTILISATEUR_INTERNE', 41, 5),
(94, 'EN_ATTENTE_RETOUR_CONTRAT_LEGALISE', '2026-09-25 09:42:12.990838', 'Retour du contrat signé et légalisé déclaré', 'EN_ATTENTE_FACTURATION', 'UTILISATEUR_INTERNE', 41, 5),
(95, 'EN_ATTENTE_FACTURATION', '2026-09-25 09:42:23.351617', 'Facture émise et demandes d\'impression des cartes créées', 'EN_PREPARATION_CARTES', 'UTILISATEUR_INTERNE', 41, 5),
(96, 'EN_PREPARATION_CARTES', '2026-09-25 09:44:31.037793', 'Toutes les cartes sont activées et testées', 'PRETE_A_FINALISER', 'UTILISATEUR_INTERNE', 41, 4),
(97, 'PRETE_A_FINALISER', '2026-09-25 09:45:29.517378', 'Dossier corporate finalisé et client informé', 'FINALISEE', 'UTILISATEUR_INTERNE', 41, 5),
(107, NULL, '2026-09-25 15:02:51.898037', NULL, 'SOUMISE', 'CLIENT', 51, NULL),
(108, 'SOUMISE', '2026-09-25 15:03:26.168647', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 51, NULL),
(109, 'EN_ATTENTE_PAIEMENT', '2026-09-25 15:05:05.230406', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 51, 3),
(110, 'EN_ATTENTE_PAIEMENT', '2026-09-25 15:08:07.532157', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 14, 3),
(111, 'EN_ATTENTE_PAIEMENT', '2026-09-25 15:08:38.474812', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 6, 3),
(112, 'PAYEE', '2026-09-25 15:10:39.888129', 'Validation finale du dossier payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 51, 5),
(113, NULL, '2026-09-26 00:38:35.538799', NULL, 'SOUMISE', 'CLIENT', 52, NULL),
(114, NULL, '2026-09-26 00:38:55.830301', NULL, 'SOUMISE', 'CLIENT', 53, NULL),
(115, 'SOUMISE', '2026-09-26 00:39:10.566369', 'Validation du code OTP corporate', 'EN_ATTENTE_VALIDATION_RESPONSABLE', 'CLIENT', 53, NULL),
(116, 'EN_ATTENTE_VALIDATION_RESPONSABLE', '2026-09-26 00:40:24.643444', 'Validation de la demande corporate par le responsable', 'VALIDEE', 'UTILISATEUR_INTERNE', 53, 5),
(117, 'VALIDEE', '2026-09-26 00:41:13.023584', 'Convocation au siège pour paiement et signature', 'EN_ATTENTE_PAIEMENT_SIGNATURE', 'UTILISATEUR_INTERNE', 53, 5),
(118, 'EN_ATTENTE_PAIEMENT_SIGNATURE', '2026-09-26 00:42:30.392416', 'Paiement par chèque confirmé et contrat remis au client', 'EN_ATTENTE_RETOUR_CONTRAT_LEGALISE', 'UTILISATEUR_INTERNE', 53, 5),
(119, 'EN_ATTENTE_RETOUR_CONTRAT_LEGALISE', '2026-09-26 00:42:48.750744', 'Retour du contrat signé et légalisé déclaré', 'EN_ATTENTE_FACTURATION', 'UTILISATEUR_INTERNE', 53, 5),
(120, 'EN_ATTENTE_FACTURATION', '2026-09-26 00:42:55.133370', 'Facture émise et demandes d\'impression des cartes créées', 'EN_PREPARATION_CARTES', 'UTILISATEUR_INTERNE', 53, 5),
(121, 'EN_PREPARATION_CARTES', '2026-09-26 00:44:43.422827', 'Toutes les cartes sont activées et testées', 'PRETE_A_FINALISER', 'UTILISATEUR_INTERNE', 53, 4),
(122, 'PRETE_A_FINALISER', '2026-09-26 00:45:33.593610', 'Dossier corporate finalisé et client informé', 'FINALISEE', 'UTILISATEUR_INTERNE', 53, 5),
(123, NULL, '2026-09-26 02:09:25.796925', NULL, 'SOUMISE', 'UTILISATEUR_INTERNE', 54, 3),
(124, 'SOUMISE', '2026-09-26 02:09:44.025268', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 54, NULL),
(125, 'EN_ATTENTE_PAIEMENT', '2026-09-26 02:10:17.374987', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 54, 3),
(126, 'PAYEE', '2026-09-26 02:28:02.236048', 'Validation finale du dossier payé', 'VALIDEE', 'UTILISATEUR_INTERNE', 14, 5),
(127, NULL, '2026-09-26 02:46:32.391365', NULL, 'SOUMISE', 'UTILISATEUR_INTERNE', 55, 3),
(128, 'SOUMISE', '2026-09-26 02:47:02.792990', 'Validation du code OTP', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 55, NULL),
(129, 'EN_ATTENTE_PAIEMENT', '2026-09-26 02:47:39.065259', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 55, 3),
(130, 'EN_ATTENTE_PAIEMENT', '2026-09-26 03:27:21.698053', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 13, 3),
(131, 'SOUMISE', '2026-09-27 08:06:13.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 56, NULL),
(132, 'SOUMISE', '2026-09-27 05:06:13.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 57, NULL),
(133, 'SOUMISE', '2026-09-26 10:06:13.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 58, NULL),
(134, 'SOUMISE', '2026-09-25 06:06:13.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 59, NULL),
(135, 'SOUMISE', '2026-09-27 09:36:13.000000', 'Création assistée au guichet', 'EN_ATTENTE_PAIEMENT', 'UTILISATEUR_INTERNE', 60, NULL),
(136, NULL, '2026-09-27 09:51:13.000000', 'Formulaire soumis en ligne', 'SOUMISE', 'CLIENT', 61, NULL),
(137, 'EN_ATTENTE_PAIEMENT', '2026-09-27 10:06:52.960878', 'Paiement enregistré', 'PAYEE', 'UTILISATEUR_INTERNE', 59, 7),
(138, 'SOUMISE', '2026-09-27 08:17:24.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 62, NULL),
(139, 'SOUMISE', '2026-09-27 05:17:24.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 63, NULL),
(140, 'SOUMISE', '2026-09-27 10:17:24.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 64, NULL),
(141, NULL, '2026-09-27 10:32:24.000000', 'Formulaire soumis en ligne', 'SOUMISE', 'CLIENT', 65, NULL),
(142, 'SOUMISE', '2026-09-27 03:17:24.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 66, NULL),
(143, 'SOUMISE', '2026-09-26 23:17:24.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 67, NULL),
(144, 'SOUMISE', '2026-09-27 07:17:24.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 68, NULL),
(145, 'SOUMISE', '2026-09-25 11:17:24.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 69, NULL),
(146, 'SOUMISE', '2026-09-26 11:17:24.000000', 'Validation OTP effectuée', 'EN_ATTENTE_PAIEMENT', 'CLIENT', 70, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ligne_facture`
--

CREATE TABLE `ligne_facture` (
  `id` bigint NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant_ht` decimal(12,2) NOT NULL,
  `montant_ttc` decimal(12,2) NOT NULL,
  `montant_tva` decimal(12,2) NOT NULL,
  `prix_unitaire_ht` decimal(12,2) NOT NULL,
  `quantite` int NOT NULL,
  `taux_tva` decimal(5,2) NOT NULL,
  `type_ligne` enum('ABONNEMENT','AUTRE','CARTE_ACCES') COLLATE utf8mb4_unicode_ci NOT NULL,
  `facture_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ligne_facture`
--

INSERT INTO `ligne_facture` (`id`, `description`, `montant_ht`, `montant_ttc`, `montant_tva`, `prix_unitaire_ht`, `quantite`, `taux_tva`, `type_ligne`, `facture_id`) VALUES
(1, 'Abonnement parking Jour 7j/7 08h-20h - 3 mois', 875.00, 1050.00, 175.00, 875.00, 1, 20.00, 'ABONNEMENT', 1),
(2, 'Frais d\'émission de la carte RFID sans contact', 41.67, 50.00, 8.33, 41.67, 1, 20.00, 'CARTE_ACCES', 1),
(3, 'Abonnement parking 24h/24 et 7j/7 place réservée - 3 mois', 2500.00, 3000.00, 500.00, 2500.00, 1, 20.00, 'ABONNEMENT', 2),
(4, 'Frais d\'émission de la carte RFID sans contact', 41.67, 50.00, 8.33, 41.67, 1, 20.00, 'CARTE_ACCES', 2),
(5, 'Abonnement parking 24h/24 et 7j/7 place non réservée - 9 mois', 3750.00, 4500.00, 750.00, 3750.00, 1, 20.00, 'ABONNEMENT', 3),
(6, 'Frais d\'émission de la carte RFID sans contact', 41.67, 50.00, 8.33, 41.67, 1, 20.00, 'CARTE_ACCES', 3),
(7, 'Abonnement parking 24h/24 et 7j/7 place non réservée - 3 mois', 1250.00, 1500.00, 250.00, 1250.00, 1, 20.00, 'ABONNEMENT', 4),
(8, 'Abonnement parking Nuit 5j/7 hors week-end 20h-08h - 3 mois', 750.00, 900.00, 150.00, 750.00, 1, 20.00, 'ABONNEMENT', 5),
(9, 'Abonnement parking Nuit 5j/7 hors week-end 20h-08h - 6 mois', 1500.00, 1800.00, 300.00, 1500.00, 1, 20.00, 'ABONNEMENT', 6),
(10, 'Abonnement parking 24h/24 et 7j/7 - 3 mois', 1750.00, 2100.00, 350.00, 1750.00, 1, 20.00, 'ABONNEMENT', 7),
(11, 'Abonnement parking 24h/24 et 7j/7 - 3 mois', 1750.00, 2100.00, 350.00, 1750.00, 1, 20.00, 'ABONNEMENT', 8),
(12, 'Abonnement corporate 20 ans - 2 place(s)', 150000.00, 180000.00, 30000.00, 150000.00, 1, 20.00, 'ABONNEMENT', 9),
(13, '2 carte(s) RFID corporate', 83.33, 100.00, 16.67, 83.33, 1, 20.00, 'CARTE_ACCES', 9),
(14, 'Abonnement corporate 20 ans - 3 place(s)', 225000.00, 270000.00, 45000.00, 225000.00, 1, 20.00, 'ABONNEMENT', 10),
(15, '3 carte(s) RFID corporate', 125.00, 150.00, 25.00, 125.00, 1, 20.00, 'CARTE_ACCES', 10),
(16, 'Abonnement parking Jour 7j/7 08h-20h - 3 mois', 1250.00, 1500.00, 250.00, 1250.00, 1, 20.00, 'ABONNEMENT', 11),
(17, 'Frais d\'émission de la carte RFID sans contact', 41.67, 50.00, 8.33, 41.67, 1, 20.00, 'CARTE_ACCES', 11),
(18, 'Abonnement corporate 20 ans - 4 place(s)', 300000.00, 360000.00, 60000.00, 300000.00, 1, 20.00, 'ABONNEMENT', 12),
(19, '4 carte(s) RFID corporate', 166.67, 200.00, 33.33, 166.67, 1, 20.00, 'CARTE_ACCES', 12),
(20, 'Abonnement parking Nuit 5j/7 20h-08h et week-end 24h/24 - 3 mois', 1125.00, 1350.00, 225.00, 1125.00, 1, 20.00, 'ABONNEMENT', 13),
(21, 'Frais d\'émission de la carte RFID sans contact', 41.67, 50.00, 8.33, 41.67, 1, 20.00, 'CARTE_ACCES', 13);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` bigint NOT NULL,
  `adresse_destination` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `canal` enum('EMAIL','SYSTEME','WHATSAPP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenu` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_envoi` datetime(6) DEFAULT NULL,
  `date_envoi_prevue` datetime(6) NOT NULL,
  `derniere_erreur` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_tentatives` int NOT NULL,
  `reference` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_metier` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('ANNULEE','A_ENVOYER','ECHEC','ENVOYEE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sujet` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_notification` enum('ABONNEMENT_EXPIRATION_J10','ABONNEMENT_EXPIRATION_J5','ABONNEMENT_EXPIRE','CARTE_ACTIVEE','CARTE_DESACTIVEE','CARTE_DISPONIBLE','CARTE_SUSPENDUE','CHEQUE_REJETE','DEMANDE_CREEE','DEMANDE_REFUSEE','DEMANDE_VALIDEE','FACTURE_DISPONIBLE','PAIEMENT_CONFIRME','RENOUVELLEMENT_PROCHE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` bigint NOT NULL,
  `client_destinataire_id` bigint DEFAULT NULL,
  `utilisateur_destinataire_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id`, `adresse_destination`, `canal`, `contenu`, `date_creation`, `date_envoi`, `date_envoi_prevue`, `derniere_erreur`, `nombre_tentatives`, `reference`, `reference_metier`, `statut`, `sujet`, `type_notification`, `version`, `client_destinataire_id`, `utilisateur_destinataire_id`) VALUES
(1, 'achraf.ouazzane00@gmail.com', 'EMAIL', '<!DOCTYPE html><html lang=\"fr\"><body style=\"font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px\">\n<div style=\"max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px\">\n  <h2 style=\"color:#075985\">Votre abonnement RRM expire dans 10 jours</h2>\n  <p>Bonjour <strong>Moustapha Jaouar</strong>,</p><p>Votre abonnement ABO-20260919-1F7689D6 prendra fin le 2026-09-30.</p>\n  <p><a href=\"http://localhost:5173/demande-publique?tab=RENEW\" style=\"display:inline-block;background:#075985;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px\">Renouveler mon abonnement</a></p>\n  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:25px 0\">\n  <p style=\"font-size:12px;color:#64748b\">Rabat Région Mobilité — RRM</p>\n</div></body></html>', '2026-09-20 19:48:00.079813', '2026-09-20 19:48:01.004303', '2026-09-20 00:00:00.000000', NULL, 1, 'NOTIF-ABO-6E20115B', 'PERIODE-ABONNEMENT-2', 'ENVOYEE', 'Votre abonnement RRM expire dans 10 jours', 'ABONNEMENT_EXPIRATION_J10', 1, 16, NULL),
(2, 'achraf.ouazzane00@gmail.com', 'EMAIL', '<!DOCTYPE html><html lang=\"fr\"><body style=\"font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px\">\n<div style=\"max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px\">\n  <h2 style=\"color:#075985\">Votre abonnement RRM expire dans 5 jours</h2>\n  <p>Bonjour <strong>Moustapha Jaouar</strong>,</p><p>Votre abonnement ABO-20260919-1F7689D6 prendra fin le 2026-09-25.</p>\n  <p><a href=\"http://localhost:5173/demande-publique?tab=RENEW\" style=\"display:inline-block;background:#075985;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px\">Renouveler mon abonnement</a></p>\n  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:25px 0\">\n  <p style=\"font-size:12px;color:#64748b\">Rabat Région Mobilité — RRM</p>\n</div></body></html>', '2026-09-20 20:38:00.021457', '2026-09-20 20:38:00.319355', '2026-09-20 00:00:00.000000', NULL, 1, 'NOTIF-ABO-CFD0D7BB', 'PERIODE-ABONNEMENT-2', 'ENVOYEE', 'Votre abonnement RRM expire dans 5 jours', 'ABONNEMENT_EXPIRATION_J5', 1, 16, NULL),
(3, 'achraf.ouazzane00@gmail.com', 'EMAIL', '<!DOCTYPE html><html lang=\"fr\"><body style=\"font-family:Arial,sans-serif;color:#0f172a;background:#f8fafc;padding:30px\">\n<div style=\"max-width:620px;margin:auto;background:#fff;border:1px solid #e2e8f0;padding:30px\">\n  <h2 style=\"color:#075985\">Votre abonnement RRM est termin&eacute;</h2>\n  <p>Bonjour <strong>Moustapha Jaouar</strong>,</p><p>Votre abonnement ABO-20260919-1F7689D6 est termin&eacute;. Votre carte ne permet plus l&#39;acc&egrave;s au parking.</p>\n  <p><a href=\"http://localhost:5173/demande-publique?tab=RENEW\" style=\"display:inline-block;background:#075985;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px\">Renouveler mon abonnement</a></p>\n  <hr style=\"border:none;border-top:1px solid #e2e8f0;margin:25px 0\">\n  <p style=\"font-size:12px;color:#64748b\">Rabat Région Mobilité — RRM</p>\n</div></body></html>', '2026-09-20 20:51:00.060818', '2026-09-20 20:51:00.769117', '2026-09-20 00:00:00.000000', NULL, 1, 'NOTIF-ABO-862B8A0B', 'PERIODE-ABONNEMENT-2', 'ENVOYEE', 'Votre abonnement RRM est terminé', 'ABONNEMENT_EXPIRE', 1, 16, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `paiement`
--

CREATE TABLE `paiement` (
  `id` bigint NOT NULL,
  `banque_cheque` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_confirmation` datetime(6) DEFAULT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_emission_cheque` date DEFAULT NULL,
  `date_rejet` datetime(6) DEFAULT NULL,
  `mode_paiement` enum('CHEQUE','ESPECE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  `motif_rejet` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_cheque` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ANNULE','CONFIRME','EN_ATTENTE','REJETE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut_cheque` enum('ENCAISSE','EN_ATTENTE_ENCAISSEMENT','REJETE') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `demande_id` bigint NOT NULL,
  `periode_abonnement_id` bigint DEFAULT NULL,
  `traite_par_utilisateur_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `paiement`
--

INSERT INTO `paiement` (`id`, `banque_cheque`, `date_confirmation`, `date_creation`, `date_emission_cheque`, `date_rejet`, `mode_paiement`, `montant`, `motif_rejet`, `numero_cheque`, `reference`, `statut`, `statut_cheque`, `demande_id`, `periode_abonnement_id`, `traite_par_utilisateur_id`) VALUES
(1, NULL, '2026-09-14 09:23:55.052339', '2026-09-14 09:23:55.052320', NULL, NULL, 'ESPECE', 7070.00, NULL, NULL, 'PAY-2026-945C3A78', 'CONFIRME', NULL, 4, NULL, 2),
(2, NULL, '2026-09-16 00:06:57.781604', '2026-09-16 00:06:57.781525', NULL, NULL, 'ESPECE', 7020.00, NULL, NULL, 'PAY-20260916-31EF5122', 'CONFIRME', NULL, 7, NULL, 3),
(3, 'BCP', '2026-09-16 00:17:30.339832', '2026-09-16 00:17:30.339793', '2027-09-16', NULL, 'CHEQUE', 7020.00, NULL, '12343456665', 'PAY-20260916-6A28C15B', 'CONFIRME', 'ENCAISSE', 8, NULL, 3),
(4, 'CIH', '2026-09-16 00:26:36.561240', '2026-09-16 00:26:36.561235', '2026-09-16', NULL, 'CHEQUE', 972.00, NULL, '12212221', 'PAY-20260916-976EC7D0', 'CONFIRME', 'ENCAISSE', 10, NULL, 3),
(5, 'BCP', '2026-09-16 16:41:27.394829', '2026-09-16 16:41:27.394807', '2026-09-16', NULL, 'CHEQUE', 1100.00, NULL, 'SVR 568787', 'PAY-20260916-024A19F6', 'CONFIRME', 'ENCAISSE', 17, NULL, 3),
(6, 'CIH', '2026-09-16 16:46:23.767504', '2026-09-16 16:46:23.767464', '2026-09-16', NULL, 'CHEQUE', 1100.00, NULL, 'BRT 7676788', 'PAY-20260916-BF6615B6', 'CONFIRME', 'ENCAISSE', 15, 1, 3),
(7, 'BCP', '2026-09-19 15:13:53.295474', '2026-09-19 15:13:53.295462', '2026-09-10', NULL, 'CHEQUE', 3050.00, NULL, 'SFT 786969', 'PAY-20260919-CD60902E', 'CONFIRME', 'ENCAISSE', 18, 2, 3),
(8, 'BCP', '2026-09-19 18:02:27.156179', '2026-09-19 18:02:27.156156', '2026-09-19', NULL, 'CHEQUE', 4550.00, NULL, 'VFR 678734', 'PAY-20260919-3C25DE66', 'CONFIRME', 'ENCAISSE', 21, 3, 3),
(9, NULL, '2026-09-21 14:06:58.545863', '2026-09-21 14:06:58.545846', NULL, NULL, 'ESPECE', 1500.00, NULL, NULL, 'PAY-20260921-3539CBD4', 'CONFIRME', NULL, 22, 7, 3),
(10, 'BCP', '2026-09-22 09:30:19.566992', '2026-09-22 09:30:19.566970', '2026-09-22', NULL, 'CHEQUE', 1500.00, NULL, '12233', 'PAY-20260922-B0D8140C', 'CONFIRME', 'ENCAISSE', 24, 8, 3),
(11, NULL, '2026-09-22 16:25:07.839821', '2026-09-22 16:25:07.839733', NULL, NULL, 'ESPECE', 900.00, NULL, NULL, 'PAY-20260922-ED2DCB8E', 'CONFIRME', NULL, 29, 12, 3),
(12, NULL, '2026-09-22 22:42:11.900234', '2026-09-22 22:42:11.900223', NULL, NULL, 'ESPECE', 1800.00, NULL, NULL, 'PAY-20260922-D1CDBA53', 'CONFIRME', NULL, 32, 13, 3),
(13, 'BCOP', '2026-09-22 22:52:54.988711', '2026-09-22 22:52:54.988706', '2026-09-23', NULL, 'CHEQUE', 2100.00, NULL, '98798', 'PAY-20260922-E7C0D401', 'CONFIRME', 'ENCAISSE', 34, 14, 3),
(14, NULL, '2026-09-23 10:32:44.680547', '2026-09-23 10:32:44.680533', NULL, NULL, 'ESPECE', 2100.00, NULL, NULL, 'PAY-20260923-26591AA4', 'CONFIRME', NULL, 35, 15, 3),
(15, 'BCP', '2026-09-25 00:40:41.407346', '2026-09-25 00:40:41.407315', '2026-09-25', NULL, 'CHEQUE', 180100.00, NULL, '43566576', 'PAY-CORP-20260925-41D6356E', 'CONFIRME', 'ENCAISSE', 39, 16, 5),
(16, 'BCP', '2026-09-25 09:41:30.497203', '2026-09-25 09:41:30.497189', '2026-09-25', NULL, 'CHEQUE', 270150.00, NULL, '4556676', 'PAY-CORP-20260925-5C72E1FF', 'CONFIRME', 'ENCAISSE', 41, 17, 5),
(17, 'BCP', '2026-09-25 15:05:05.230393', '2026-09-25 15:05:05.230380', '2026-09-25', NULL, 'CHEQUE', 1550.00, NULL, '9879', 'PAY-20260925-28063897', 'CONFIRME', 'ENCAISSE', 51, 18, 3),
(18, 'BOA', '2026-09-25 15:08:07.532151', '2026-09-25 15:08:07.532145', '2026-09-25', NULL, 'CHEQUE', 1400.00, NULL, '8890', 'PAY-20260925-56FC7F09', 'CONFIRME', 'ENCAISSE', 14, 20, 3),
(19, NULL, '2026-09-25 15:08:38.474807', '2026-09-25 15:08:38.474803', NULL, NULL, 'ESPECE', 2030.00, NULL, NULL, 'PAY-20260925-DB76F792', 'CONFIRME', NULL, 6, NULL, 3),
(20, 'BCP', '2026-09-26 00:42:30.380704', '2026-09-26 00:42:30.380690', '2026-09-26', NULL, 'CHEQUE', 360200.00, NULL, '87897', 'PAY-CORP-20260926-FECC71BA', 'CONFIRME', 'ENCAISSE', 53, 19, 5),
(21, 'BCP', '2026-09-26 02:10:17.374954', '2026-09-26 02:10:17.374928', '2026-09-26', NULL, 'CHEQUE', 2750.00, NULL, '4535', 'PAY-20260926-C0CD19A9', 'CONFIRME', 'ENCAISSE', 54, NULL, 3),
(22, 'CD', '2026-09-26 02:47:39.065249', '2026-09-26 02:47:39.065239', '2026-09-26', NULL, 'CHEQUE', 6050.00, NULL, '5667', 'PAY-20260926-F25288CD', 'CONFIRME', 'ENCAISSE', 55, NULL, 3),
(23, 'CIH', '2026-09-26 03:27:21.697961', '2026-09-26 03:27:21.697941', '2026-09-26', NULL, 'CHEQUE', 3950.00, NULL, '68768', 'PAY-20260926-1A250796', 'CONFIRME', 'ENCAISSE', 13, NULL, 3),
(24, NULL, '2026-09-27 10:06:52.960177', '2026-09-27 10:06:52.960162', NULL, NULL, 'ESPECE', 1130.00, NULL, NULL, 'PAY-20260927-64E355EA', 'CONFIRME', NULL, 59, NULL, 7),
(25, NULL, '2026-09-27 12:29:51.000000', '2026-09-27 12:04:05.000000', NULL, NULL, 'ESPECE', 500.00, NULL, NULL, 'PAI-20260927-001', 'CONFIRME', NULL, 3, NULL, 7),
(26, NULL, '2026-09-27 12:29:51.000000', '2026-09-27 12:04:05.000000', NULL, NULL, 'ESPECE', 500.00, NULL, NULL, 'PAI-20260927-002', 'CONFIRME', NULL, 4, NULL, 7),
(29, 'Attijariwafa Bank', '2026-09-27 12:29:51.000000', '2026-09-27 12:29:51.000000', '2026-09-27', NULL, 'CHEQUE', 1000.00, NULL, 'CHQ-894102', 'PAI-20260927-003', 'CONFIRME', 'EN_ATTENTE_ENCAISSEMENT', 5, NULL, 7);

-- --------------------------------------------------------

--
-- Table structure for table `parking`
--

CREATE TABLE `parking` (
  `id` bigint NOT NULL,
  `code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `capacite_totale` int NOT NULL,
  `capacite_reservee_abonnements` int NOT NULL,
  `statut` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIF',
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_archivage` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `parking`
--

INSERT INTO `parking` (`id`, `code`, `nom`, `adresse`, `latitude`, `longitude`, `capacite_totale`, `capacite_reservee_abonnements`, `statut`, `date_creation`, `date_modification`, `date_archivage`) VALUES
(1, 'PLACE_RUSSIE', 'Place de Russie', 'Place de Russie, Rabat', 34.0194140, -6.8499600, 125, 63, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(2, 'BAB_FES', 'Bab Fès', 'Bab Fès, Salé', 34.0346686, -6.8187501, 553, 249, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(3, 'THEATRE_MOHAMMED_V', 'Théâtre Mohammed V', 'Avenue Moulay Rachid, Rabat', 34.0197817, -6.8324132, 245, 98, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(4, 'PLACE_ITALIE', 'Parking Place d\'Italie', 'Place d\'Italie, Rabat', 34.0225100, -6.8497330, 74, 37, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(5, 'RABIA_AL_ADAOUIA', 'Parking Rabia Al Adaouia', 'Avenue Allal Ben Abdellah, Rabat', 34.0005610, -6.8451000, 160, 72, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(6, 'BADR', 'Parking Badr', 'Agdal, Rabat', 34.0002490, -6.8495740, 340, 170, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(7, 'OULED_DLIM', 'Ouled Dlim', 'Avenue Hassan II, Témara', 33.9456090, -6.8895240, 737, 626, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(8, 'BAB_CHELLAH', 'Bab Chellah', 'Bab Chellah, Rabat', 34.0234265, -6.8337261, 495, 223, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(9, 'BAB_EL_HAD', 'Bab El Had', 'Bab El Had, Rabat', 34.0224939, -6.8408849, 471, 212, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(10, 'HARHOURA_NORD', 'Harhoura Nord', 'Plage Harhoura Nord, Témara', 33.9367547, -6.9412297, 247, 124, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(11, 'RUE_BRUXELLES', 'Rue de Bruxelles', 'Rue de Bruxelles, Rabat', 34.0206450, -6.8481050, 87, 44, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(12, 'HARHOURA_SURFACE', 'Parking en surface Harhoura', 'Harhoura Littoral, Témara', 33.9382120, -6.9401820, 221, 88, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(13, 'PARKING_CHELLAH', 'Parking en surface Chellah', 'Chellah, Rabat', 34.0064820, -6.8254770, 180, 72, 'ACTIF', '2026-09-11 15:31:18', '2026-09-25 11:10:07', NULL),
(14, 'TEMARA_PLAGE', 'Parking Témara Plage', 'Plage de Témara, Témara', 33.9304010, -6.9529660, 258, 103, 'ACTIF', '2026-09-25 11:10:07', '2026-09-25 11:10:07', NULL),
(15, 'ROND_POINT_KHALISS', 'Parking Rond-point Khaliss', 'Rond-point Khaliss, Harhoura', 33.9353500, -6.9436230, 74, 30, 'ACTIF', '2026-09-25 11:10:07', '2026-09-25 11:10:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `periode_abonnement`
--

CREATE TABLE `periode_abonnement` (
  `id` bigint NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `numero` int NOT NULL,
  `prixhtapplique` decimal(12,2) NOT NULL,
  `statut` enum('ACTIVE','ANNULEE','EXPIREE','PLANIFIEE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tauxtvaapplique` decimal(5,2) NOT NULL,
  `abonnement_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `periode_abonnement`
--

INSERT INTO `periode_abonnement` (`id`, `date_creation`, `date_debut`, `date_fin`, `numero`, `prixhtapplique`, `statut`, `tauxtvaapplique`, `abonnement_id`) VALUES
(1, '2026-09-17 17:16:44.426571', '2026-09-17', '2026-12-16', 1, 875.01, 'ACTIVE', 20.00, 1),
(2, '2026-09-19 15:15:02.586321', '2026-09-19', '2026-09-19', 1, 2499.99, 'EXPIREE', 20.00, 2),
(3, '2026-09-19 18:04:54.221889', '2026-09-19', '2027-06-18', 1, 3750.03, 'ACTIVE', 20.00, 3),
(7, '2026-09-21 20:41:18.556403', '2026-12-17', '2027-03-16', 2, 1250.00, 'PLANIFIEE', 20.00, 1),
(8, '2026-09-22 09:30:50.355125', '2027-06-19', '2027-09-18', 2, 1250.00, 'PLANIFIEE', 20.00, 3),
(9, '2026-09-22 15:27:38.000000', '2026-08-23', '2026-12-21', 1, 1250.00, 'ACTIVE', 20.00, 4),
(10, '2026-09-22 15:27:39.000000', '2026-07-24', '2026-11-21', 1, 1000.00, 'ACTIVE', 20.00, 5),
(11, '2026-09-22 15:27:39.000000', '2026-05-25', '2026-09-21', 1, 1250.00, 'EXPIREE', 20.00, 6),
(12, '2026-09-22 16:30:55.294239', '2026-12-22', '2027-03-21', 2, 750.00, 'PLANIFIEE', 20.00, 4),
(13, '2026-09-22 22:42:35.787075', '2026-11-22', '2027-05-21', 2, 1500.00, 'PLANIFIEE', 20.00, 5),
(14, '2026-09-22 22:53:21.601836', '2026-09-22', '2026-12-21', 2, 1750.00, 'ACTIVE', 20.00, 6),
(15, '2026-09-23 10:33:02.891362', '2026-12-22', '2027-03-21', 3, 1750.00, 'PLANIFIEE', 20.00, 6),
(16, '2026-09-25 00:40:51.685848', '2026-09-25', '2046-09-24', 1, 150000.00, 'ACTIVE', 20.00, 7),
(17, '2026-09-25 09:42:23.276105', '2026-09-25', '2046-09-24', 1, 225000.00, 'ACTIVE', 20.00, 8),
(18, '2026-09-25 15:10:39.901847', '2026-09-25', '2026-12-24', 1, 1250.00, 'ACTIVE', 20.00, 9),
(19, '2026-09-26 00:42:55.017729', '2026-09-26', '2046-09-25', 1, 300000.00, 'ACTIVE', 20.00, 10),
(20, '2026-09-26 02:28:02.286084', '2026-09-26', '2026-12-25', 1, 1125.00, 'ACTIVE', 20.00, 11),
(21, '2026-09-27 12:33:18.000000', '2026-01-01', '2026-12-31', 1, 416.67, 'ACTIVE', 20.00, 12),
(22, '2026-09-27 12:33:18.000000', '2026-01-01', '2026-12-31', 1, 416.67, 'ACTIVE', 20.00, 13);

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `id` bigint NOT NULL,
  `active` bit(1) NOT NULL,
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `libelle` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission`
--

INSERT INTO `permission` (`id`, `active`, `code`, `description`, `libelle`) VALUES
(1, b'1', 'UTILISATEUR_CONSULTER', 'Permission système : utilisateur consulter', 'utilisateur consulter'),
(2, b'1', 'UTILISATEUR_CREER', 'Permission système : utilisateur creer', 'utilisateur creer'),
(3, b'1', 'UTILISATEUR_MODIFIER', 'Permission système : utilisateur modifier', 'utilisateur modifier'),
(4, b'1', 'UTILISATEUR_BLOQUER', 'Permission système : utilisateur bloquer', 'utilisateur bloquer'),
(5, b'1', 'UTILISATEUR_DESACTIVER', 'Permission système : utilisateur desactiver', 'utilisateur desactiver'),
(6, b'1', 'ROLE_ATTRIBUER', 'Permission système : role attribuer', 'role attribuer'),
(7, b'1', 'ROLE_RETIRER', 'Permission système : role retirer', 'role retirer'),
(8, b'1', 'PARKING_AFFECTER_AGENT', 'Permission système : parking affecter agent', 'parking affecter agent'),
(9, b'1', 'PARKING_RETIRER_AGENT', 'Permission système : parking retirer agent', 'parking retirer agent'),
(10, b'1', 'AUDIT_SECURITE_CONSULTER', 'Permission système : audit securite consulter', 'audit securite consulter'),
(11, b'1', 'DEMANDE_CONSULTER', 'Permission système : demande consulter', 'demande consulter'),
(12, b'1', 'DEMANDE_MODIFIER', 'Permission système : demande modifier', 'demande modifier'),
(13, b'1', 'PAIEMENT_ENREGISTRER', 'Permission système : paiement enregistrer', 'paiement enregistrer'),
(14, b'1', 'DEMANDE_VALIDER', 'Permission système : demande valider', 'demande valider'),
(15, b'1', 'CARTE_IMPRIMER', 'Permission système : carte imprimer', 'carte imprimer'),
(16, b'1', 'CARTE_ACTIVER', 'Permission système : carte activer', 'carte activer'),
(17, b'1', 'CARTE_REMETTRE', 'Permission système : carte remettre', 'carte remettre');

-- --------------------------------------------------------

--
-- Table structure for table `piece_jointe`
--

CREATE TABLE `piece_jointe` (
  `id` bigint NOT NULL,
  `checksum_sha256` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_archivage` datetime(6) DEFAULT NULL,
  `date_depot` datetime(6) NOT NULL,
  `date_rejet` datetime(6) DEFAULT NULL,
  `date_validation` datetime(6) DEFAULT NULL,
  `motif_rejet` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_fichier_original` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ARCHIVEE','REJETEE','TELEVERSEE','VALIDEE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `storage_key` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `taille_octets` bigint NOT NULL,
  `type_mime` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_piece` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` bigint NOT NULL,
  `client_id` bigint DEFAULT NULL,
  `demande_id` bigint DEFAULT NULL,
  `deposee_par_utilisateur_id` bigint DEFAULT NULL,
  `validee_par_utilisateur_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `piece_jointe`
--

INSERT INTO `piece_jointe` (`id`, `checksum_sha256`, `date_archivage`, `date_depot`, `date_rejet`, `date_validation`, `motif_rejet`, `nom_fichier_original`, `reference`, `statut`, `storage_key`, `taille_octets`, `type_mime`, `type_piece`, `version`, `client_id`, `demande_id`, `deposee_par_utilisateur_id`, `validee_par_utilisateur_id`) VALUES
(1, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-12 16:54:42.119029', NULL, NULL, NULL, '8929670.jpg', 'PJ-820724BE77E14803993E', 'TELEVERSEE', 'demandes/DEM-20260912-7A4C3D7F/3b7b9c8b-9ddd-4f41-9b2a-7366950b9073.jpg', 702713, 'image/jpeg', 'CIN_RECTO', 0, NULL, 3, NULL, NULL),
(2, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-12 16:54:42.122543', NULL, NULL, NULL, '8929670.jpg', 'PJ-8E4249AB5F624366B271', 'TELEVERSEE', 'demandes/DEM-20260912-7A4C3D7F/5606a40b-77e3-4fc7-86df-e5f4e55012f9.jpg', 702713, 'image/jpeg', 'CIN_VERSO', 0, NULL, 3, NULL, NULL),
(3, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-12 16:54:42.125242', NULL, NULL, NULL, '8929670.jpg', 'PJ-A0B26595EB864CE0B34F', 'TELEVERSEE', 'demandes/DEM-20260912-7A4C3D7F/1d36d280-9f04-4f3d-9653-674d8ad506cb.jpg', 702713, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 3, NULL, NULL),
(4, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-12 16:54:42.128130', NULL, NULL, NULL, '8929670.jpg', 'PJ-5B557F558631460AADBE', 'TELEVERSEE', 'demandes/DEM-20260912-7A4C3D7F/69b8ecc0-d6e5-4058-8601-c031998c33c6.jpg', 702713, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 3, NULL, NULL),
(5, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-12 22:37:30.950852', NULL, NULL, NULL, '8929670.jpg', 'PJ-08E3C9AA3D194DEAA9D9', 'TELEVERSEE', 'demandes/DEM-20260912-46FC9BCE/6fc3a54c-d73d-4c4c-8858-cdb87fc9776c.jpg', 702713, 'image/jpeg', 'CIN_RECTO', 0, NULL, 4, NULL, NULL),
(6, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-12 22:37:30.963117', NULL, NULL, NULL, '8929670.jpg', 'PJ-70985A612E6849488724', 'TELEVERSEE', 'demandes/DEM-20260912-46FC9BCE/acdbf7ad-d9d8-4468-9777-c6964523ceb0.jpg', 702713, 'image/jpeg', 'CIN_VERSO', 0, NULL, 4, NULL, NULL),
(7, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-12 22:37:30.969686', NULL, NULL, NULL, '8929670.jpg', 'PJ-266E6EF96BC742B7A8D6', 'TELEVERSEE', 'demandes/DEM-20260912-46FC9BCE/ff6e0e1e-3392-4973-b696-9a6497f7e3f8.jpg', 702713, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 4, NULL, NULL),
(8, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-12 22:37:30.975522', NULL, NULL, NULL, '8929670.jpg', 'PJ-72AB824D7CCA4628B50B', 'TELEVERSEE', 'demandes/DEM-20260912-46FC9BCE/2d11becc-57bc-4ffd-a96c-baf7d9383b7e.jpg', 702713, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 4, NULL, NULL),
(9, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-13 11:28:55.044917', NULL, NULL, NULL, '8929670.jpg', 'PJ-0769D32BFA7D4D80AECE', 'TELEVERSEE', 'demandes/DEM-20260913-BA9BF51A/16be4b81-8500-4af9-ba52-41d5aa0d58ac.jpg', 702713, 'image/jpeg', 'CIN_RECTO', 0, NULL, 5, NULL, NULL),
(10, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-13 11:28:55.047961', NULL, NULL, NULL, '8929670.jpg', 'PJ-29A3EB9DB3FE42CD9C2B', 'TELEVERSEE', 'demandes/DEM-20260913-BA9BF51A/30016c3b-c4e9-4fe0-9953-e51cb63be3fc.jpg', 702713, 'image/jpeg', 'CIN_VERSO', 0, NULL, 5, NULL, NULL),
(11, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-13 11:28:55.051241', NULL, NULL, NULL, '8929670.jpg', 'PJ-2CDFDB893B42410B824E', 'TELEVERSEE', 'demandes/DEM-20260913-BA9BF51A/53f24abd-0938-4b16-83df-1111bc692abe.jpg', 702713, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 5, NULL, NULL),
(12, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-13 11:28:55.053783', NULL, NULL, NULL, '8929670.jpg', 'PJ-5A63812E9F374872B69B', 'TELEVERSEE', 'demandes/DEM-20260913-BA9BF51A/65660ccf-7402-4c2a-a0b7-1455060c65dc.jpg', 702713, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 5, NULL, NULL),
(13, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-14 19:44:40.910967', NULL, NULL, NULL, '8929670.jpg', 'PJ-DCD37B86BE1247D58530', 'TELEVERSEE', 'demandes/DEM-20260914-081B45A8/a2033ffe-83d9-4082-8aa9-4bccb2a76e1a.jpg', 702713, 'image/jpeg', 'CIN_RECTO', 0, NULL, 6, NULL, NULL),
(14, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-14 19:44:40.936008', NULL, NULL, NULL, '8929670.jpg', 'PJ-275E8F67BA8A4592A22D', 'TELEVERSEE', 'demandes/DEM-20260914-081B45A8/9c036546-8ab3-4755-84f1-1a741f363feb.jpg', 702713, 'image/jpeg', 'CIN_VERSO', 0, NULL, 6, NULL, NULL),
(15, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-14 19:44:40.948248', NULL, NULL, NULL, '8929670.jpg', 'PJ-3514FEDDFC644247A3AB', 'TELEVERSEE', 'demandes/DEM-20260914-081B45A8/774a1cd0-e5f1-4ceb-92de-d9d86e59f49f.jpg', 702713, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 6, NULL, NULL),
(16, 'de021502c5517b346e6575612b058a026afe3024fa522139dac6ac3de8d8e7a0', NULL, '2026-09-14 19:44:40.957769', NULL, NULL, NULL, '8929670.jpg', 'PJ-8D1E332A19714E29A1C0', 'TELEVERSEE', 'demandes/DEM-20260914-081B45A8/a7e05bb5-93cc-42b9-ba52-849e354c3ba3.jpg', 702713, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 6, NULL, NULL),
(17, 'c555feef37a6b461c25930eb23f6e83013acd46045790061c517c0c4f4b9420e', NULL, '2026-09-15 14:53:38.387299', NULL, NULL, NULL, 'monaco-fog-summer-sunrise-ah.jpg', 'PJ-558992E6B90A44C88B7A', 'TELEVERSEE', '14heBvNZyDulSwZ2ygHg4exAzZaqoSCV-', 5683394, 'image/jpeg', 'CIN_RECTO', 0, NULL, 7, NULL, NULL),
(18, 'bb3f22dad08c93bebab168772f62c17af8bfe8bd6a2296d2f242f2851bda6401', NULL, '2026-09-15 14:53:40.884138', NULL, NULL, NULL, 'house-in-ocean-al-3440x1440.jpg', 'PJ-135444091A2C4E6ABD83', 'TELEVERSEE', '15x4wZ8TxyHvjO4N9r9xPuWPJWYBt5cE2', 2599525, 'image/jpeg', 'CIN_VERSO', 0, NULL, 7, NULL, NULL),
(19, 'b6baa5914bdc13c4f16d518547dba1652913f2709a6aafd85965e14bc2d70a66', NULL, '2026-09-15 14:53:43.969071', NULL, NULL, NULL, 'birds-flying-at-sunset-with-bare-tree-silhouette-cd-3840x2160.jpg', 'PJ-4BDAAC8C50534E35BF2B', 'TELEVERSEE', '1mM2kfUMxft9WaC1hqksRnG6V-X9qZCq0', 3666412, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 7, NULL, NULL),
(20, '4630be4925a47f6686a64f349bea5cd32062f8cb3a9f42bb8e72bd7eb03040c2', NULL, '2026-09-15 14:53:46.133469', NULL, NULL, NULL, 'téléchargement (1).jpg', 'PJ-E7377E84EE4E45AAB932', 'TELEVERSEE', '1CbY5jE5mA09JBwWfiyo14GEcgIkM9g9T', 23909, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 7, NULL, NULL),
(21, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-16 00:14:42.190878', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-C47EDE0C3E51454DBB4C', 'TELEVERSEE', '1k0y6p9co_NYLEXrlrF2tWh9KlnQtmQ6Z', 103257, 'image/jpeg', 'CIN_RECTO', 0, NULL, 8, NULL, NULL),
(22, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-16 00:14:44.323157', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-70F589F32CF9435B8913', 'TELEVERSEE', '1KHhUeKL54oimxM811dm7rCkgsQVVL_QH', 103257, 'image/jpeg', 'CIN_VERSO', 0, NULL, 8, NULL, NULL),
(23, 'd75d1e35832b13927ed2cff7f8c15b99ef2719c652c772a05956cfdb100122e4', NULL, '2026-09-16 00:14:46.655685', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.12.22.jpeg', 'PJ-90F9ECA19C3B4C66B5F9', 'TELEVERSEE', '1Dq-ZSexd2Pgb2qZVEB5mmmloJuYUjpPT', 106521, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 8, NULL, NULL),
(24, '5d5abd28907e0e2ddb868363ae1bfbfee703da6f515b54e17c2999d320f619f5', NULL, '2026-09-16 00:14:48.740715', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.39.jpeg', 'PJ-30BF61D14B03447E86C4', 'TELEVERSEE', '1LNtTrT1Ks5XAJ7bobpceU0YypBdgLBLh', 69058, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 8, NULL, NULL),
(25, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-16 00:15:12.527132', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-B99F39CCBD0446308D6F', 'TELEVERSEE', '17ej4GSZEDQSShKKgeHlu0GvNlcdfPrUx', 103257, 'image/jpeg', 'CIN_RECTO', 0, NULL, 9, NULL, NULL),
(26, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-16 00:15:14.487636', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-30AC4220CA7D4711980B', 'TELEVERSEE', '1VTelruBSNHHIhYZmhxBIP-VuGCPcQh5j', 103257, 'image/jpeg', 'CIN_VERSO', 0, NULL, 9, NULL, NULL),
(27, 'd75d1e35832b13927ed2cff7f8c15b99ef2719c652c772a05956cfdb100122e4', NULL, '2026-09-16 00:15:16.542856', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.12.22.jpeg', 'PJ-83FC3289BD66468DAB94', 'TELEVERSEE', '1-Em20Cg4-kHijroI-x_l2RZ47H4LaAmn', 106521, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 9, NULL, NULL),
(28, '5d5abd28907e0e2ddb868363ae1bfbfee703da6f515b54e17c2999d320f619f5', NULL, '2026-09-16 00:15:18.575075', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.39.jpeg', 'PJ-F72AA936A43F4C0195FA', 'TELEVERSEE', '1GQFA5ZrFea1RA6P6T5-YLtXVmeYZ_Xmv', 69058, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 9, NULL, NULL),
(29, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-16 00:23:11.281839', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-6D164A92D8064BEBA68D', 'TELEVERSEE', '19ZMKxFI7xhKgoIO5itrNMY1kjmtGA30X', 103257, 'image/jpeg', 'CIN_RECTO', 0, NULL, 10, NULL, NULL),
(30, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-16 00:23:13.329831', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-5C0658419949469993B9', 'TELEVERSEE', '1DqfxYnHqNQvU_-P3RO-DqAE43Krf1Ztw', 103257, 'image/jpeg', 'CIN_VERSO', 0, NULL, 10, NULL, NULL),
(31, 'd75d1e35832b13927ed2cff7f8c15b99ef2719c652c772a05956cfdb100122e4', NULL, '2026-09-16 00:23:15.365051', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.12.22.jpeg', 'PJ-966141D160E04867BF94', 'TELEVERSEE', '1d4T50vxpAFg0XI3TSsfZIWK5wmX6Am04', 106521, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 10, NULL, NULL),
(32, '5d5abd28907e0e2ddb868363ae1bfbfee703da6f515b54e17c2999d320f619f5', NULL, '2026-09-16 00:23:17.294776', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.39.jpeg', 'PJ-7B93FA33F18348C28B9F', 'TELEVERSEE', '1e2acJHUkA1U1iJgQeMCDPv6MQjf-9BIB', 69058, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 10, NULL, NULL),
(33, '57336648061a8e143e3bcb7c1518bcdd0a43d555e232b758afe2f8708afa2664', NULL, '2026-09-16 11:17:50.268512', NULL, NULL, NULL, 'Capture d\'écran 2025-08-02 193946.png', 'PJ-E678788BC7AD46E8B04D', 'TELEVERSEE', '1GlhrA37OrEUpOWfWatIzcExYZtv6rspV', 733763, 'image/png', 'CIN_RECTO', 0, NULL, 11, NULL, NULL),
(34, '47cf1e34370eeb2a28864a4a2f3a02d2ee918bc38842479fbb2f7665b1c3f880', NULL, '2026-09-16 11:17:52.505691', NULL, NULL, NULL, 'Capture d\'écran 2025-10-09 180502.png', 'PJ-75E7F8F4582C4191B45E', 'TELEVERSEE', '1vdLF_bTBPq0pwxaBHqDRfZQbNJ4Fd9J3', 410663, 'image/png', 'CIN_VERSO', 0, NULL, 11, NULL, NULL),
(35, '387d84a8451215fe258fe87713897571b146dd8f76a169bdd8a3611a05a4e9e7', NULL, '2026-09-16 11:17:54.703809', NULL, NULL, NULL, 'Capture d\'écran 2025-12-06 094100.png', 'PJ-16AA55EB25A14666902A', 'TELEVERSEE', '1JBivusajtocpujZ0IBxVnd03yRH8kDVb', 465647, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 11, NULL, NULL),
(36, '32e28a97a01d340c36570d1b76f82ee6e94fd5813f4a1f74737b3d76ff9ccfb0', NULL, '2026-09-16 11:17:56.755129', NULL, NULL, NULL, 'Capture d\'écran 2026-06-21 041821.png', 'PJ-5896CDBCFAD041EFA29E', 'TELEVERSEE', '1nlVbnd0popp41Tj42Jsg9y1OHp6ilVl-', 646476, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 11, NULL, NULL),
(37, '873fe2414831475f1b54ae2b331bfd279ba2033610a09d80b95a86b785fa025d', NULL, '2026-09-16 12:57:14.221813', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 004939.png', 'PJ-DFA82530AE164E45AD48', 'TELEVERSEE', '1BFLbhzGdOaRv8RQYb1nc7jEYTuMN9iUd', 435382, 'image/png', 'CIN_RECTO', 0, NULL, 12, NULL, NULL),
(38, '06aaf985122d15e7936b10e392caa2b0657696c20efbb4643b200b3cd68d0e5b', NULL, '2026-09-16 12:57:16.552477', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071130.png', 'PJ-231795DFB721438D943A', 'TELEVERSEE', '1ZxEoXBmDUGD5x3MyA0tkIeL8-GLwamGi', 464386, 'image/png', 'CIN_VERSO', 0, NULL, 12, NULL, NULL),
(39, '3a0bcfbbd155c3a8506214662c0e9e477b738116b0f97f4aecfa78e59813db55', NULL, '2026-09-16 12:57:18.536342', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 083154.png', 'PJ-7986749B44CC43DF901A', 'TELEVERSEE', '1w3doAvkL7pWUo7v7EEwo9Dm12taKBtlJ', 183197, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 12, NULL, NULL),
(40, 'aaa651da6db9310e03eeeab434b4dc0515ba8ff8cd966bec12d0857067023e20', NULL, '2026-09-16 12:57:20.945650', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 083426.png', 'PJ-59560EF13AB543A1A969', 'TELEVERSEE', '1IsJw3sMpuQA2wODmTvCuggoF75OF7jDo', 440702, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 12, NULL, NULL),
(41, 'd0a9e0b800d06d3f1c15346130a3041d53b6d7e50b7ef99f2aa2a92e3382e955', NULL, '2026-09-16 13:12:57.548265', NULL, NULL, NULL, 'Capture d\'écran 2025-09-28 164556.png', 'PJ-E682193B7DC841ED8E6C', 'TELEVERSEE', '11-171Yh0HkuiNVosb24L6bRJ9SL4DD8z', 3285674, 'image/png', 'CIN_RECTO', 0, NULL, 13, NULL, NULL),
(42, '2776c1db632ef9c45b8253733d1ebd4089ed837735431ad90e434cc1095c9f35', NULL, '2026-09-16 13:12:59.722529', NULL, NULL, NULL, 'Capture d\'écran 2026-05-08 175446.png', 'PJ-5C13347FEB4F44FCA9A4', 'TELEVERSEE', '1RZorF1DCKsN4MNx-Lu88kuWe9S04-LmE', 641433, 'image/png', 'CIN_VERSO', 0, NULL, 13, NULL, NULL),
(43, '4b6a5f8afcec21114abbc32276b6cdbd26833a8feece72b6ad8b7f38e0755c26', NULL, '2026-09-16 13:13:02.253232', NULL, NULL, NULL, 'Capture d\'écran 2025-12-16 092226.png', 'PJ-84582170C2EB462BBB62', 'TELEVERSEE', '17aaeC-2WuWT45SgqNvRO6D8BtgwFhg6-', 796971, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 13, NULL, NULL),
(44, 'bc4b30eb30d76928636a48a8265b27797b5f14aa60b4f21c6153c0fe5edb5813', NULL, '2026-09-16 13:13:04.395595', NULL, NULL, NULL, 'Capture d\'écran 2026-06-17 022343.png', 'PJ-3B06ABF0937D4A759646', 'TELEVERSEE', '1_0SbQGzVy0yK8JKxfe9AD3mAOR88rmyv', 661233, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 13, NULL, NULL),
(45, '26bb76033cbfec29c324e74e4491f36ff592d90dd20622280fd224c7e3d07e42', NULL, '2026-09-16 14:18:20.916018', NULL, NULL, NULL, 'Capture d\'écran 2026-06-23 041501.png', 'PJ-D5423F22AAD5460180A8', 'TELEVERSEE', '1sq70HhLqjJJuDt4p_tsVQs6ahSBW6C2c', 1072244, 'image/png', 'CIN_RECTO', 0, NULL, 14, NULL, NULL),
(46, '2f454d4c85cb748391eb1f38066875017c63fca2c63251abc96b6f836f24b97a', NULL, '2026-09-16 14:18:22.968696', NULL, NULL, NULL, 'Capture d\'écran 2026-05-14 182213.png', 'PJ-031C8DD89C4A4202AADB', 'TELEVERSEE', '1euo9dCKGgMkU_oVsk6YmUng27f-sBLE7', 36585, 'image/png', 'CIN_VERSO', 0, NULL, 14, NULL, NULL),
(47, '3a0bcfbbd155c3a8506214662c0e9e477b738116b0f97f4aecfa78e59813db55', NULL, '2026-09-16 14:18:25.199183', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 083154.png', 'PJ-B2B50BAB96704CACADBE', 'TELEVERSEE', '1y7lKRs5SYU9bcXIzv4PeQYk6FxQbNNOJ', 183197, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 14, NULL, NULL),
(48, '1a5759596eb6af9bf21d7b6a422dbb18546d4d71c984fca014cf6e49bd62e779', NULL, '2026-09-16 14:18:27.136884', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 114315.png', 'PJ-563B62AFE0B54515AD6A', 'TELEVERSEE', '1Ea7u0zY5kq9Cko7sFOzGYvz8fhvGbI0w', 120412, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 14, NULL, NULL),
(49, '873fe2414831475f1b54ae2b331bfd279ba2033610a09d80b95a86b785fa025d', NULL, '2026-09-16 15:42:47.657085', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 004939.png', 'PJ-59EF2DA23D0649AFB064', 'TELEVERSEE', '1L6P4PbFBSFSTdR9Ml5SHY2pGD1Dq9s_h', 435382, 'image/png', 'CIN_RECTO', 0, NULL, 15, NULL, NULL),
(50, '06aaf985122d15e7936b10e392caa2b0657696c20efbb4643b200b3cd68d0e5b', NULL, '2026-09-16 15:42:49.967416', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071130.png', 'PJ-9AE687D4B3A640A7A2A7', 'TELEVERSEE', '1kNjtDnE5EP6YaYdTBp-Jjpa-L1QoVpZp', 464386, 'image/png', 'CIN_VERSO', 0, NULL, 15, NULL, NULL),
(51, 'b6d80bd06a557314319baeea6a96ffdf86ddc070ea8a4b1ccb57fcf874b03898', NULL, '2026-09-16 15:42:52.386392', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 005028.png', 'PJ-97B2D3F111974EAEA954', 'TELEVERSEE', '1JPGUQ6IQRDENGVaTFZiVLaX5iA8q6nY3', 375619, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 15, NULL, NULL),
(52, '06aaf985122d15e7936b10e392caa2b0657696c20efbb4643b200b3cd68d0e5b', NULL, '2026-09-16 15:42:55.147945', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071130.png', 'PJ-168D736BCA634D29AA46', 'TELEVERSEE', '1ucCo_f9aLRHE3PsLSAGa4CMQMgh95KZg', 464386, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 15, NULL, NULL),
(53, '873fe2414831475f1b54ae2b331bfd279ba2033610a09d80b95a86b785fa025d', NULL, '2026-09-16 16:01:01.935442', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 004939.png', 'PJ-6B202B32B22F43019D88', 'TELEVERSEE', '1rKtmFPbXx7KJHwnt7RSgN_VHvG5kryqz', 435382, 'image/png', 'CIN_RECTO', 0, NULL, 16, NULL, NULL),
(54, '2825ad00c0660d724fb006a3d91411b2e81ac46ad17c1726efea56881120fc81', NULL, '2026-09-16 16:01:04.230772', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071821.png', 'PJ-69DF6E48F4D9456CB5FE', 'TELEVERSEE', '1uzbQRvCnVsaWz43h-MzMIc86xryZmt5B', 429840, 'image/png', 'CIN_VERSO', 0, NULL, 16, NULL, NULL),
(55, 'aaa651da6db9310e03eeeab434b4dc0515ba8ff8cd966bec12d0857067023e20', NULL, '2026-09-16 16:01:06.495658', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 083426.png', 'PJ-649091201D2A414B960D', 'TELEVERSEE', '18YpauisHxetKQEqA_KHRO_2DR5k1YmmC', 440702, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 16, NULL, NULL),
(56, '06aaf985122d15e7936b10e392caa2b0657696c20efbb4643b200b3cd68d0e5b', NULL, '2026-09-16 16:01:09.219588', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071130.png', 'PJ-01242D083FCF4C11867A', 'TELEVERSEE', '1f4giV-wH-wBrpxmJPjwXjfMqnujtF20e', 464386, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 16, NULL, NULL),
(57, '873fe2414831475f1b54ae2b331bfd279ba2033610a09d80b95a86b785fa025d', NULL, '2026-09-16 16:05:08.408914', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 004939.png', 'PJ-2347586C85C14515A894', 'TELEVERSEE', '1BzgsS-MaJRFiegAYhNSyNPS57GTCeN-t', 435382, 'image/png', 'CIN_RECTO', 0, NULL, 17, NULL, NULL),
(58, '2825ad00c0660d724fb006a3d91411b2e81ac46ad17c1726efea56881120fc81', NULL, '2026-09-16 16:05:10.335318', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071821.png', 'PJ-1ECF0E6B367D4C19ABB7', 'TELEVERSEE', '1-X_CYrb5NZExWbpfgCm-9ZH0NCu6sGoR', 429840, 'image/png', 'CIN_VERSO', 0, NULL, 17, NULL, NULL),
(59, 'aaa651da6db9310e03eeeab434b4dc0515ba8ff8cd966bec12d0857067023e20', NULL, '2026-09-16 16:05:12.496336', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 083426.png', 'PJ-ABF785C0621B4C619FDE', 'TELEVERSEE', '1jVxhSxzLw6VHrWmPpSxXWPFRbzvqxPEK', 440702, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 17, NULL, NULL),
(60, '06aaf985122d15e7936b10e392caa2b0657696c20efbb4643b200b3cd68d0e5b', NULL, '2026-09-16 16:05:14.482045', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071130.png', 'PJ-CCB6180A5A154BB5B11F', 'TELEVERSEE', '1G6a4e84VTZhaCNx5x5B2ztQVbfdW0vKa', 464386, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 17, NULL, NULL),
(61, 'd75d1e35832b13927ed2cff7f8c15b99ef2719c652c772a05956cfdb100122e4', NULL, '2026-09-19 15:11:18.554015', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.12.22.jpeg', 'PJ-3DC32D06C6384FF2AB14', 'TELEVERSEE', '1T1I6ZxMTfwmbxw3ELSyTYLIzoaDe7F0A', 106521, 'image/jpeg', 'CIN_RECTO', 0, NULL, 18, NULL, NULL),
(62, '5d5abd28907e0e2ddb868363ae1bfbfee703da6f515b54e17c2999d320f619f5', NULL, '2026-09-19 15:11:20.762576', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.39.jpeg', 'PJ-A6DD29178CC94ABA879F', 'TELEVERSEE', '1nYLaouV-nd5vX-LKYcKYO6cO_8eE6DYo', 69058, 'image/jpeg', 'CIN_VERSO', 0, NULL, 18, NULL, NULL),
(63, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-19 15:11:22.886588', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-B48DF5914C654D63911D', 'TELEVERSEE', '1nkNspTY_v4Kronr23LEPjULOE9waLSAf', 103257, 'image/jpeg', 'CARTE_GRISE_RECTO', 0, NULL, 18, NULL, NULL),
(64, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-19 15:11:25.249489', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-90957D25916546F5BC84', 'TELEVERSEE', '1V-r2TfzTowDKezNELToIlFWpgdWoEdss', 103257, 'image/jpeg', 'CARTE_GRISE_VERSO', 0, NULL, 18, NULL, NULL),
(65, 'd75d1e35832b13927ed2cff7f8c15b99ef2719c652c772a05956cfdb100122e4', NULL, '2026-09-19 17:55:52.581667', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.12.22.jpeg', 'PJ-4B958E359E7C41B49ED3', 'TELEVERSEE', '10mm6J2MhbHy-AeFw7Plk14DvzX6rM3uz', 106521, 'image/jpeg', 'CIN_RECTO', 0, NULL, 19, NULL, NULL),
(66, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-19 17:55:54.658360', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-067EB8CEC8614BBFA708', 'TELEVERSEE', '1gi4HIbqgguYspjX1FRW2-TZ7Rsxn0HE_', 103257, 'image/jpeg', 'CIN_VERSO', 0, NULL, 19, NULL, NULL),
(67, '73cedda92c71c54a174b3f4b3ec89987d5b598a31ff31193d40f3f132af21fca', NULL, '2026-09-19 17:55:57.606052', NULL, NULL, NULL, 'ChatGPT Image 17 sept. 2026, 22_32_01.png', 'PJ-308DD419CBA44E89AFB2', 'TELEVERSEE', '1EzDgQHG3et5KrSydlcfpWoNnop5q8Rkz', 1709577, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 19, NULL, NULL),
(68, 'e72b59615c1c4ca4625b185f969e903196cd7df275e45955636ad392ddd84bef', NULL, '2026-09-19 17:56:00.785774', NULL, NULL, NULL, 'ChatGPT Image 17 sept. 2026, 21_30_26.png', 'PJ-CD750D66F18D4C0CB58B', 'TELEVERSEE', '1lazRNAjATl-DeQ71dvThJQDXSonmYEge', 1798259, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 19, NULL, NULL),
(69, 'd75d1e35832b13927ed2cff7f8c15b99ef2719c652c772a05956cfdb100122e4', NULL, '2026-09-19 17:56:40.957431', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.12.22.jpeg', 'PJ-32D150B53F2241C5833F', 'TELEVERSEE', '1rod6ostXTlxbuIJ2LpcrCiCFGY_ZNTqr', 106521, 'image/jpeg', 'CIN_RECTO', 0, NULL, 20, NULL, NULL),
(70, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-19 17:56:43.539714', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-EDE86181C76745A2BB11', 'TELEVERSEE', '1dd263atHnQJhGJ0_Z3Ghj2T0WH8G7Ycl', 103257, 'image/jpeg', 'CIN_VERSO', 0, NULL, 20, NULL, NULL),
(71, '73cedda92c71c54a174b3f4b3ec89987d5b598a31ff31193d40f3f132af21fca', NULL, '2026-09-19 17:56:46.710992', NULL, NULL, NULL, 'ChatGPT Image 17 sept. 2026, 22_32_01.png', 'PJ-E360BB610BAC4A028CE9', 'TELEVERSEE', '1HP7FmiGTIz4wP-5XnxA4tMSBmYgZ5Fxt', 1709577, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 20, NULL, NULL),
(72, 'e72b59615c1c4ca4625b185f969e903196cd7df275e45955636ad392ddd84bef', NULL, '2026-09-19 17:56:49.561601', NULL, NULL, NULL, 'ChatGPT Image 17 sept. 2026, 21_30_26.png', 'PJ-0E13AD2916E34317BA12', 'TELEVERSEE', '1dH0ETjwIqAj5CwiC68YwCaiJWaBnA8Af', 1798259, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 20, NULL, NULL),
(73, 'd75d1e35832b13927ed2cff7f8c15b99ef2719c652c772a05956cfdb100122e4', NULL, '2026-09-19 17:57:55.575340', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.12.22.jpeg', 'PJ-6A742852B4314528B66C', 'TELEVERSEE', '1irsJJuocKkNRmnw_ogASO7JMaUD2T73u', 106521, 'image/jpeg', 'CIN_RECTO', 0, NULL, 21, NULL, NULL),
(74, '3ecccbfbbfd87c6bb18c9ca9f5b80c8132c0bd80d84ef1a53d64ad2cd507d0bc', NULL, '2026-09-19 17:57:57.570783', NULL, NULL, NULL, 'WhatsApp Image 2026-09-16 at 02.11.3s9.jpeg', 'PJ-13C554EF0E004C10B72E', 'TELEVERSEE', '16H7PVEmAzwDitGtpOOvq5AYlh4lgkhiB', 103257, 'image/jpeg', 'CIN_VERSO', 0, NULL, 21, NULL, NULL),
(75, '73cedda92c71c54a174b3f4b3ec89987d5b598a31ff31193d40f3f132af21fca', NULL, '2026-09-19 17:58:00.225505', NULL, NULL, NULL, 'ChatGPT Image 17 sept. 2026, 22_32_01.png', 'PJ-F277A5D72BAE4EE1B9C4', 'TELEVERSEE', '1VIXP1nAnrgOFR0AtiKokmBYg6VQoWRzA', 1709577, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 21, NULL, NULL),
(76, 'e72b59615c1c4ca4625b185f969e903196cd7df275e45955636ad392ddd84bef', NULL, '2026-09-19 17:58:03.013096', NULL, NULL, NULL, 'ChatGPT Image 17 sept. 2026, 21_30_26.png', 'PJ-EE2179D52AE94CF88416', 'TELEVERSEE', '1vk-h77VaaIAKf1UN0otlpFuQjVf-Loj2', 1798259, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 21, NULL, NULL),
(77, '06aaf985122d15e7936b10e392caa2b0657696c20efbb4643b200b3cd68d0e5b', NULL, '2026-09-25 15:02:54.914460', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071130.png', 'PJ-F0575EA5A409498B8176', 'TELEVERSEE', '1cVupmCLp4D364Fuy3evlcAtDAHCZQBuY', 464386, 'image/png', 'CIN_RECTO', 0, NULL, 51, NULL, NULL),
(78, 'e30b46efe0cb0ffcfec5e74a48ccb4c4d938003f9e44509fc210ff9b5a489919', NULL, '2026-09-25 15:02:57.439358', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 071949.png', 'PJ-965E1B47C3E0420FBC6D', 'TELEVERSEE', '15DttKQ_R0PqhZQY2M7FRtC-FlCYFJNPT', 469797, 'image/png', 'CIN_VERSO', 0, NULL, 51, NULL, NULL),
(79, '5da0eaf5498305a56f56dc7715a6d52be0eeba87294e5bb726ca6c2e1e1875a9', NULL, '2026-09-25 15:03:00.042003', NULL, NULL, NULL, 'Capture d\'écran 2025-04-30 113541.png', 'PJ-79479B2EF68448D89B63', 'TELEVERSEE', '1Lnji_kTZP13j6g4dDTjGvstWyLlcK_nB', 170681, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 51, NULL, NULL),
(80, 'e6ee3a06ae394f093c6ccf9612d13f30435c289cbe998603f7807745593172f5', NULL, '2026-09-25 15:03:02.020934', NULL, NULL, NULL, 'Capture d\'écran 2025-05-12 213434.png', 'PJ-4596DDF4DBA34F5BA98F', 'TELEVERSEE', '1mZi9uh0I6A408kbMwDbovAOseHknDZzP', 15389, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 51, NULL, NULL),
(81, '432adfe109eeb2f9a5a233f934f73e6e5109d34543010993e389ed6314cf8c61', NULL, '2026-09-26 02:09:28.641264', NULL, NULL, NULL, 'Capture d\'écran 2026-07-02 120634.png', 'PJ-E6129EAC5A2E49BEBD40', 'TELEVERSEE', '17i2ybGW0QBgD3wf59He_jUnqTEUFk7q1', 106682, 'image/png', 'CIN_RECTO', 0, NULL, 54, NULL, NULL),
(82, '432adfe109eeb2f9a5a233f934f73e6e5109d34543010993e389ed6314cf8c61', NULL, '2026-09-26 02:09:30.689871', NULL, NULL, NULL, 'Capture d\'écran 2026-07-02 120634.png', 'PJ-3092FE1D81C64D8183AC', 'TELEVERSEE', '1pJrU2h-ubLZ3Lcsbxx9i-b0ob1UUraxm', 106682, 'image/png', 'CIN_VERSO', 0, NULL, 54, NULL, NULL),
(83, '432adfe109eeb2f9a5a233f934f73e6e5109d34543010993e389ed6314cf8c61', NULL, '2026-09-26 02:09:32.463700', NULL, NULL, NULL, 'Capture d\'écran 2026-07-02 120634.png', 'PJ-77E77F9865B5471F9E77', 'TELEVERSEE', '1cHhjwcvBPoxWK76rFL6Bq04duq_adb26', 106682, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 54, NULL, NULL),
(84, '432adfe109eeb2f9a5a233f934f73e6e5109d34543010993e389ed6314cf8c61', NULL, '2026-09-26 02:09:34.170105', NULL, NULL, NULL, 'Capture d\'écran 2026-07-02 120634.png', 'PJ-A44E8212C49944E7BB22', 'TELEVERSEE', '1IP3YuIwdSoKtKWvdCtNKgJkQ34KSka5N', 106682, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 54, NULL, NULL),
(85, '432adfe109eeb2f9a5a233f934f73e6e5109d34543010993e389ed6314cf8c61', NULL, '2026-09-26 02:46:34.937558', NULL, NULL, NULL, 'Capture d\'écran 2026-07-02 120634.png', 'PJ-98C56B9BBA2B4F159D83', 'TELEVERSEE', '16P6aBZ0KIXQABvYDLf_MYbEs8PwHg4QD', 106682, 'image/png', 'CIN_RECTO', 0, NULL, 55, NULL, NULL),
(86, '432adfe109eeb2f9a5a233f934f73e6e5109d34543010993e389ed6314cf8c61', NULL, '2026-09-26 02:46:36.739305', NULL, NULL, NULL, 'Capture d\'écran 2026-07-02 120634.png', 'PJ-9ED2B3E304234CF3A8D0', 'TELEVERSEE', '1jiOI-Z8Q3ZLIPsZ0oZoa6wV2N16liuay', 106682, 'image/png', 'CIN_VERSO', 0, NULL, 55, NULL, NULL),
(87, '432adfe109eeb2f9a5a233f934f73e6e5109d34543010993e389ed6314cf8c61', NULL, '2026-09-26 02:46:38.636049', NULL, NULL, NULL, 'Capture d\'écran 2026-07-02 120634.png', 'PJ-0C4EBD91D860467F9B3C', 'TELEVERSEE', '1Maayx6VNSZdC8F2eJYrVwhb-Do5Eqph9', 106682, 'image/png', 'CARTE_GRISE_RECTO', 0, NULL, 55, NULL, NULL),
(88, '432adfe109eeb2f9a5a233f934f73e6e5109d34543010993e389ed6314cf8c61', NULL, '2026-09-26 02:46:40.564781', NULL, NULL, NULL, 'Capture d\'écran 2026-07-02 120634.png', 'PJ-FFF30A23DF4C4CF595D7', 'TELEVERSEE', '1YK8cVFn77b0bU8DJPTpbvPN06VXCD31U', 106682, 'image/png', 'CARTE_GRISE_VERSO', 0, NULL, 55, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plage_acces`
--

CREATE TABLE `plage_acces` (
  `id` bigint NOT NULL,
  `acces_toute_la_journee` bit(1) NOT NULL,
  `heure_debut` time DEFAULT NULL,
  `heure_fin` time DEFAULT NULL,
  `forfait_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plage_acces_jour`
--

CREATE TABLE `plage_acces_jour` (
  `plage_acces_id` bigint NOT NULL,
  `jour_semaine` enum('DIMANCHE','JEUDI','LUNDI','MARDI','MERCREDI','SAMEDI','VENDREDI') COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recu`
--

CREATE TABLE `recu` (
  `id` bigint NOT NULL,
  `date_generation` datetime(6) NOT NULL,
  `mode_paiement` enum('CHEQUE','ESPECE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant_recu` decimal(12,2) NOT NULL,
  `numero` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paiement_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recu`
--

INSERT INTO `recu` (`id`, `date_generation`, `mode_paiement`, `montant_recu`, `numero`, `paiement_id`) VALUES
(1, '2026-09-14 09:23:55.094321', 'ESPECE', 7070.00, 'REC-2026-B0D270E0', 1),
(2, '2026-09-16 16:46:23.819661', 'CHEQUE', 1100.00, 'REC-20260916-82B30B6D', 6),
(3, '2026-09-19 15:13:53.308105', 'CHEQUE', 3050.00, 'REC-20260919-EE47B22B', 7),
(4, '2026-09-19 18:02:27.176495', 'CHEQUE', 4550.00, 'REC-20260919-32C27D00', 8),
(5, '2026-09-21 14:06:58.596930', 'ESPECE', 1500.00, 'REC-20260921-494F3FF9', 9),
(6, '2026-09-22 09:30:19.597339', 'CHEQUE', 1500.00, 'REC-20260922-9E24B288', 10),
(7, '2026-09-22 16:25:07.888886', 'ESPECE', 900.00, 'REC-20260922-ABC831A9', 11),
(8, '2026-09-22 22:42:11.946814', 'ESPECE', 1800.00, 'REC-20260922-55EC7B8B', 12),
(9, '2026-09-22 22:52:54.995409', 'CHEQUE', 2100.00, 'REC-20260922-9987BDBD', 13),
(10, '2026-09-23 10:32:44.696162', 'ESPECE', 2100.00, 'REC-20260923-3670BFCF', 14),
(11, '2026-09-25 15:05:05.242380', 'CHEQUE', 1550.00, 'REC-20260925-73E7C9B1', 17),
(12, '2026-09-25 15:08:07.540427', 'CHEQUE', 1400.00, 'REC-20260925-8FCC03A7', 18),
(13, '2026-09-25 15:08:38.481506', 'ESPECE', 2030.00, 'REC-20260925-140752FE', 19),
(14, '2026-09-26 02:10:17.388831', 'CHEQUE', 2750.00, 'REC-20260926-DE15DA0F', 21),
(15, '2026-09-26 02:47:39.074795', 'CHEQUE', 6050.00, 'REC-20260926-4E7B159B', 22),
(16, '2026-09-26 03:27:21.727796', 'CHEQUE', 3950.00, 'REC-20260926-400B9627', 23),
(17, '2026-09-27 10:06:53.103088', 'ESPECE', 1130.00, 'REC-20260927-61EFBEC8', 24);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint NOT NULL,
  `active` bit(1) NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `libelle` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `active`, `code`, `description`, `libelle`) VALUES
(1, b'1', 'AGENT_ADMINISTRATIF', 'Rôle système : agent administratif', 'agent administratif'),
(2, b'1', 'SUPERVISEUR', 'Rôle système : superviseur', 'superviseur'),
(3, b'1', 'RESPONSABLE_STATIONNEMENT', 'Rôle système : responsable stationnement', 'responsable stationnement'),
(4, b'1', 'COMPTABLE', 'Rôle système : comptable', 'comptable'),
(5, b'1', 'RESPONSABLE_REPORTING', 'Rôle système : responsable reporting', 'responsable reporting'),
(6, b'1', 'ADMINISTRATEUR_SI', 'Rôle système : administrateur si', 'administrateur si'),
(7, b'1', 'DIRECTION_GENERALE', 'Rôle système : direction generale', 'direction generale'),
(8, b'1', 'VICE_RESPONSABLE', 'Rôle système : vice responsable', 'vice responsable');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`role_id`, `permission_id`) VALUES
(6, 1),
(6, 2),
(6, 3),
(6, 4),
(6, 5),
(6, 6),
(6, 7),
(6, 8),
(6, 9),
(6, 10),
(1, 11),
(2, 11),
(3, 11),
(6, 11),
(1, 12),
(6, 12),
(1, 13),
(6, 13),
(2, 14),
(3, 14),
(6, 14),
(1, 15),
(6, 15),
(2, 16),
(6, 16),
(1, 17),
(6, 17);

-- --------------------------------------------------------

--
-- Table structure for table `tarif_parking`
--

CREATE TABLE `tarif_parking` (
  `id` bigint NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_debut_validite` date NOT NULL,
  `date_fin_validite` date DEFAULT NULL,
  `duree_en_mois` int NOT NULL,
  `prix_ht` decimal(12,2) NOT NULL,
  `taux_tva` decimal(5,2) NOT NULL,
  `forfait_id` bigint NOT NULL,
  `parking_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tarif_parking`
--

INSERT INTO `tarif_parking` (`id`, `date_creation`, `date_debut_validite`, `date_fin_validite`, `duree_en_mois`, `prix_ht`, `taux_tva`, `forfait_id`, `parking_id`) VALUES
(1, '2026-09-11 15:32:08.755181', '2026-01-01', '2026-09-15', 3, 300.00, 20.00, 1, 9),
(2, '2026-09-11 15:32:08.779130', '2026-01-01', '2026-09-15', 6, 300.00, 20.00, 1, 9),
(3, '2026-09-11 15:32:08.791442', '2026-01-01', '2026-09-15', 9, 300.00, 20.00, 1, 9),
(4, '2026-09-11 15:32:08.805961', '2026-01-01', '2026-09-15', 12, 300.00, 20.00, 1, 9),
(5, '2026-09-11 15:32:08.855753', '2026-01-01', '2026-09-15', 3, 350.00, 20.00, 2, 9),
(6, '2026-09-11 15:32:08.868795', '2026-01-01', '2026-09-15', 6, 350.00, 20.00, 2, 9),
(7, '2026-09-11 15:32:08.881375', '2026-01-01', '2026-09-15', 9, 350.00, 20.00, 2, 9),
(8, '2026-09-11 15:32:08.894046', '2026-01-01', '2026-09-15', 12, 350.00, 20.00, 2, 9),
(9, '2026-09-11 15:32:08.926330', '2026-01-01', '2026-09-15', 3, 450.00, 20.00, 3, 9),
(10, '2026-09-11 15:32:08.938571', '2026-01-01', '2026-09-15', 6, 450.00, 20.00, 3, 9),
(11, '2026-09-11 15:32:08.951787', '2026-01-01', '2026-09-15', 9, 450.00, 20.00, 3, 9),
(12, '2026-09-11 15:32:08.970659', '2026-01-01', '2026-09-15', 12, 450.00, 20.00, 3, 9),
(13, '2026-09-11 15:32:09.021411', '2026-01-01', '2026-09-15', 3, 500.00, 20.00, 4, 9),
(14, '2026-09-11 15:32:09.036758', '2026-01-01', '2026-09-15', 6, 500.00, 20.00, 4, 9),
(15, '2026-09-11 15:32:09.055088', '2026-01-01', '2026-09-15', 9, 500.00, 20.00, 4, 9),
(16, '2026-09-11 15:32:09.075764', '2026-01-01', '2026-09-15', 12, 500.00, 20.00, 4, 9),
(17, '2026-09-11 15:32:09.139290', '2026-01-01', '2026-09-15', 3, 550.00, 20.00, 5, 9),
(18, '2026-09-11 15:32:09.160152', '2026-01-01', '2026-09-15', 6, 550.00, 20.00, 5, 9),
(19, '2026-09-11 15:32:09.181489', '2026-01-01', '2026-09-15', 9, 550.00, 20.00, 5, 9),
(20, '2026-09-11 15:32:09.200322', '2026-01-01', '2026-09-15', 12, 550.00, 20.00, 5, 9),
(21, '2026-09-11 15:32:09.251684', '2026-01-01', '2026-09-15', 3, 650.00, 20.00, 6, 9),
(22, '2026-09-11 15:32:09.272550', '2026-01-01', '2026-09-15', 6, 650.00, 20.00, 6, 9),
(23, '2026-09-11 15:32:09.290110', '2026-01-01', '2026-09-15', 9, 650.00, 20.00, 6, 9),
(24, '2026-09-11 15:32:09.306663', '2026-01-01', '2026-09-15', 12, 650.00, 20.00, 6, 9),
(25, '2026-09-11 15:32:09.352236', '2026-01-01', '2026-09-15', 3, 1000.00, 20.00, 7, 9),
(26, '2026-09-11 15:32:09.367726', '2026-01-01', '2026-09-15', 6, 1000.00, 20.00, 7, 9),
(27, '2026-09-11 15:32:09.382836', '2026-01-01', '2026-09-15', 9, 1000.00, 20.00, 7, 9),
(28, '2026-09-11 15:32:09.396862', '2026-01-01', '2026-09-15', 12, 1000.00, 20.00, 7, 9),
(29, '2026-09-11 15:32:09.430038', '2026-01-01', '2026-09-15', 3, 300.00, 20.00, 1, 8),
(30, '2026-09-11 15:32:09.440140', '2026-01-01', '2026-09-15', 6, 300.00, 20.00, 1, 8),
(31, '2026-09-11 15:32:09.449977', '2026-01-01', '2026-09-15', 9, 300.00, 20.00, 1, 8),
(32, '2026-09-11 15:32:09.460979', '2026-01-01', '2026-09-15', 12, 300.00, 20.00, 1, 8),
(33, '2026-09-11 15:32:09.488933', '2026-01-01', '2026-09-15', 3, 350.00, 20.00, 2, 8),
(34, '2026-09-11 15:32:09.503679', '2026-01-01', '2026-09-15', 6, 350.00, 20.00, 2, 8),
(35, '2026-09-11 15:32:09.516389', '2026-01-01', '2026-09-15', 9, 350.00, 20.00, 2, 8),
(36, '2026-09-11 15:32:09.527663', '2026-01-01', '2026-09-15', 12, 350.00, 20.00, 2, 8),
(37, '2026-09-11 15:32:09.555921', '2026-01-01', '2026-09-15', 3, 450.00, 20.00, 3, 8),
(38, '2026-09-11 15:32:09.567071', '2026-01-01', '2026-09-15', 6, 450.00, 20.00, 3, 8),
(39, '2026-09-11 15:32:09.578845', '2026-01-01', '2026-09-15', 9, 450.00, 20.00, 3, 8),
(40, '2026-09-11 15:32:09.588353', '2026-01-01', '2026-09-15', 12, 450.00, 20.00, 3, 8),
(41, '2026-09-11 15:32:09.613668', '2026-01-01', '2026-09-15', 3, 500.00, 20.00, 4, 8),
(42, '2026-09-11 15:32:09.624514', '2026-01-01', '2026-09-15', 6, 500.00, 20.00, 4, 8),
(43, '2026-09-11 15:32:09.636503', '2026-01-01', '2026-09-15', 9, 500.00, 20.00, 4, 8),
(44, '2026-09-11 15:32:09.646696', '2026-01-01', '2026-09-15', 12, 500.00, 20.00, 4, 8),
(45, '2026-09-11 15:32:09.671634', '2026-01-01', '2026-09-15', 3, 550.00, 20.00, 5, 8),
(46, '2026-09-11 15:32:09.685493', '2026-01-01', '2026-09-15', 6, 550.00, 20.00, 5, 8),
(47, '2026-09-11 15:32:09.695568', '2026-01-01', '2026-09-15', 9, 550.00, 20.00, 5, 8),
(48, '2026-09-11 15:32:09.703526', '2026-01-01', '2026-09-15', 12, 550.00, 20.00, 5, 8),
(49, '2026-09-11 15:32:09.727955', '2026-01-01', '2026-09-15', 3, 650.00, 20.00, 6, 8),
(50, '2026-09-11 15:32:09.738483', '2026-01-01', '2026-09-15', 6, 650.00, 20.00, 6, 8),
(51, '2026-09-11 15:32:09.749366', '2026-01-01', '2026-09-15', 9, 650.00, 20.00, 6, 8),
(52, '2026-09-11 15:32:09.757784', '2026-01-01', '2026-09-15', 12, 650.00, 20.00, 6, 8),
(53, '2026-09-11 15:32:09.778943', '2026-01-01', '2026-09-15', 3, 1000.00, 20.00, 7, 8),
(54, '2026-09-11 15:32:09.787202', '2026-01-01', '2026-09-15', 6, 1000.00, 20.00, 7, 8),
(55, '2026-09-11 15:32:09.797184', '2026-01-01', '2026-09-15', 9, 1000.00, 20.00, 7, 8),
(56, '2026-09-11 15:32:09.805839', '2026-01-01', '2026-09-15', 12, 1000.00, 20.00, 7, 8),
(57, '2026-09-11 15:32:09.835018', '2026-01-01', '2026-09-15', 3, 300.00, 20.00, 1, 1),
(58, '2026-09-11 15:32:09.848046', '2026-01-01', '2026-09-15', 6, 300.00, 20.00, 1, 1),
(59, '2026-09-11 15:32:09.860022', '2026-01-01', '2026-09-15', 9, 300.00, 20.00, 1, 1),
(60, '2026-09-11 15:32:09.872304', '2026-01-01', '2026-09-15', 12, 300.00, 20.00, 1, 1),
(61, '2026-09-11 15:32:09.899208', '2026-01-01', '2026-09-15', 3, 350.00, 20.00, 2, 1),
(62, '2026-09-11 15:32:09.910663', '2026-01-01', '2026-09-15', 6, 350.00, 20.00, 2, 1),
(63, '2026-09-11 15:32:09.921211', '2026-01-01', '2026-09-15', 9, 350.00, 20.00, 2, 1),
(64, '2026-09-11 15:32:09.932739', '2026-01-01', '2026-09-15', 12, 350.00, 20.00, 2, 1),
(65, '2026-09-11 15:32:09.956320', '2026-01-01', '2026-09-15', 3, 450.00, 20.00, 3, 1),
(66, '2026-09-11 15:32:09.968996', '2026-01-01', '2026-09-15', 6, 450.00, 20.00, 3, 1),
(67, '2026-09-11 15:32:09.982539', '2026-01-01', '2026-09-15', 9, 450.00, 20.00, 3, 1),
(68, '2026-09-11 15:32:09.993833', '2026-01-01', '2026-09-15', 12, 450.00, 20.00, 3, 1),
(69, '2026-09-11 15:32:10.019419', '2026-01-01', '2026-09-15', 3, 500.00, 20.00, 4, 1),
(70, '2026-09-11 15:32:10.030672', '2026-01-01', '2026-09-15', 6, 500.00, 20.00, 4, 1),
(71, '2026-09-11 15:32:10.039802', '2026-01-01', '2026-09-15', 9, 500.00, 20.00, 4, 1),
(72, '2026-09-11 15:32:10.055915', '2026-01-01', '2026-09-15', 12, 500.00, 20.00, 4, 1),
(73, '2026-09-11 15:32:10.082816', '2026-01-01', '2026-09-15', 3, 550.00, 20.00, 5, 1),
(74, '2026-09-11 15:32:10.092709', '2026-01-01', '2026-09-15', 6, 550.00, 20.00, 5, 1),
(75, '2026-09-11 15:32:10.103673', '2026-01-01', '2026-09-15', 9, 550.00, 20.00, 5, 1),
(76, '2026-09-11 15:32:10.113259', '2026-01-01', '2026-09-15', 12, 550.00, 20.00, 5, 1),
(77, '2026-09-11 15:32:10.137092', '2026-01-01', '2026-09-15', 3, 650.00, 20.00, 6, 1),
(78, '2026-09-11 15:32:10.148855', '2026-01-01', '2026-09-15', 6, 650.00, 20.00, 6, 1),
(79, '2026-09-11 15:32:10.160364', '2026-01-01', '2026-09-15', 9, 650.00, 20.00, 6, 1),
(80, '2026-09-11 15:32:10.170431', '2026-01-01', '2026-09-15', 12, 650.00, 20.00, 6, 1),
(81, '2026-09-11 15:32:10.197903', '2026-01-01', '2026-09-15', 3, 1000.00, 20.00, 7, 1),
(82, '2026-09-11 15:32:10.212583', '2026-01-01', '2026-09-15', 6, 1000.00, 20.00, 7, 1),
(83, '2026-09-11 15:32:10.228102', '2026-01-01', '2026-09-15', 9, 1000.00, 20.00, 7, 1),
(84, '2026-09-11 15:32:10.246175', '2026-01-01', '2026-09-15', 12, 1000.00, 20.00, 7, 1),
(85, '2026-09-11 15:32:10.278211', '2026-01-01', '2026-09-15', 3, 300.00, 20.00, 1, 11),
(86, '2026-09-11 15:32:10.292399', '2026-01-01', '2026-09-15', 6, 300.00, 20.00, 1, 11),
(87, '2026-09-11 15:32:10.305131', '2026-01-01', '2026-09-15', 9, 300.00, 20.00, 1, 11),
(88, '2026-09-11 15:32:10.320812', '2026-01-01', '2026-09-15', 12, 300.00, 20.00, 1, 11),
(89, '2026-09-11 15:32:10.348361', '2026-01-01', '2026-09-15', 3, 350.00, 20.00, 2, 11),
(90, '2026-09-11 15:32:10.359796', '2026-01-01', '2026-09-15', 6, 350.00, 20.00, 2, 11),
(91, '2026-09-11 15:32:10.370799', '2026-01-01', '2026-09-15', 9, 350.00, 20.00, 2, 11),
(92, '2026-09-11 15:32:10.382604', '2026-01-01', '2026-09-15', 12, 350.00, 20.00, 2, 11),
(93, '2026-09-11 15:32:10.414871', '2026-01-01', '2026-09-15', 3, 450.00, 20.00, 3, 11),
(94, '2026-09-11 15:32:10.427419', '2026-01-01', '2026-09-15', 6, 450.00, 20.00, 3, 11),
(95, '2026-09-11 15:32:10.438317', '2026-01-01', '2026-09-15', 9, 450.00, 20.00, 3, 11),
(96, '2026-09-11 15:32:10.450159', '2026-01-01', '2026-09-15', 12, 450.00, 20.00, 3, 11),
(97, '2026-09-11 15:32:10.477865', '2026-01-01', '2026-09-15', 3, 500.00, 20.00, 4, 11),
(98, '2026-09-11 15:32:10.489401', '2026-01-01', '2026-09-15', 6, 500.00, 20.00, 4, 11),
(99, '2026-09-11 15:32:10.501729', '2026-01-01', '2026-09-15', 9, 500.00, 20.00, 4, 11),
(100, '2026-09-11 15:32:10.514859', '2026-01-01', '2026-09-15', 12, 500.00, 20.00, 4, 11),
(101, '2026-09-11 15:32:10.545454', '2026-01-01', '2026-09-15', 3, 550.00, 20.00, 5, 11),
(102, '2026-09-11 15:32:10.557435', '2026-01-01', '2026-09-15', 6, 550.00, 20.00, 5, 11),
(103, '2026-09-11 15:32:10.571233', '2026-01-01', '2026-09-15', 9, 550.00, 20.00, 5, 11),
(104, '2026-09-11 15:32:10.584411', '2026-01-01', '2026-09-15', 12, 550.00, 20.00, 5, 11),
(105, '2026-09-11 15:32:10.615643', '2026-01-01', '2026-09-15', 3, 650.00, 20.00, 6, 11),
(106, '2026-09-11 15:32:10.627245', '2026-01-01', '2026-09-15', 6, 650.00, 20.00, 6, 11),
(107, '2026-09-11 15:32:10.640836', '2026-01-01', '2026-09-15', 9, 650.00, 20.00, 6, 11),
(108, '2026-09-11 15:32:10.652433', '2026-01-01', '2026-09-15', 12, 650.00, 20.00, 6, 11),
(109, '2026-09-11 15:32:10.680415', '2026-01-01', '2026-09-15', 3, 1000.00, 20.00, 7, 11),
(110, '2026-09-11 15:32:10.689616', '2026-01-01', '2026-09-15', 6, 1000.00, 20.00, 7, 11),
(111, '2026-09-11 15:32:10.703177', '2026-01-01', '2026-09-15', 9, 1000.00, 20.00, 7, 11),
(112, '2026-09-11 15:32:10.718362', '2026-01-01', '2026-09-15', 12, 1000.00, 20.00, 7, 11),
(113, '2026-09-11 15:32:10.748313', '2026-01-01', '2026-09-15', 3, 500.00, 20.00, 4, 3),
(114, '2026-09-11 15:32:10.757637', '2026-01-01', '2026-09-15', 6, 500.00, 20.00, 4, 3),
(115, '2026-09-11 15:32:10.767444', '2026-01-01', '2026-09-15', 9, 500.00, 20.00, 4, 3),
(116, '2026-09-11 15:32:10.779183', '2026-01-01', '2026-09-15', 12, 500.00, 20.00, 4, 3),
(117, '2026-09-11 15:32:10.809020', '2026-01-01', '2026-09-15', 3, 700.00, 20.00, 8, 3),
(118, '2026-09-11 15:32:10.819368', '2026-01-01', '2026-09-15', 6, 700.00, 20.00, 8, 3),
(119, '2026-09-11 15:32:10.829861', '2026-01-01', '2026-09-15', 9, 700.00, 20.00, 8, 3),
(120, '2026-09-11 15:32:10.840799', '2026-01-01', '2026-09-15', 12, 700.00, 20.00, 8, 3),
(121, '2026-09-11 15:32:10.868755', '2026-01-01', '2026-09-15', 3, 270.00, 20.00, 2, 3),
(122, '2026-09-11 15:32:10.879828', '2026-01-01', '2026-09-15', 6, 270.00, 20.00, 2, 3),
(123, '2026-09-11 15:32:10.886942', '2026-01-01', '2026-09-15', 9, 270.00, 20.00, 2, 3),
(124, '2026-09-11 15:32:10.896453', '2026-01-01', '2026-09-15', 12, 270.00, 20.00, 2, 3),
(125, '2026-09-11 15:32:10.919515', '2026-01-01', '2026-09-15', 3, 350.00, 20.00, 6, 2),
(126, '2026-09-11 15:32:10.927307', '2026-01-01', '2026-09-15', 6, 350.00, 20.00, 6, 2),
(127, '2026-09-11 15:32:10.935865', '2026-01-01', '2026-09-15', 9, 350.00, 20.00, 6, 2),
(128, '2026-09-11 15:32:10.946959', '2026-01-01', '2026-09-15', 12, 350.00, 20.00, 6, 2),
(129, '2026-09-11 15:32:10.975143', '2026-01-01', '2026-09-15', 3, 300.00, 20.00, 9, 2),
(130, '2026-09-11 15:32:10.983945', '2026-01-01', '2026-09-15', 6, 300.00, 20.00, 9, 2),
(131, '2026-09-11 15:32:10.993993', '2026-01-01', '2026-09-15', 9, 300.00, 20.00, 9, 2),
(132, '2026-09-11 15:32:11.001245', '2026-01-01', '2026-09-15', 12, 300.00, 20.00, 9, 2),
(133, '2026-09-11 15:32:11.030950', '2026-01-01', '2026-09-15', 3, 300.00, 20.00, 10, 2),
(134, '2026-09-11 15:32:11.040535', '2026-01-01', '2026-09-15', 6, 300.00, 20.00, 10, 2),
(135, '2026-09-11 15:32:11.055465', '2026-01-01', '2026-09-15', 9, 300.00, 20.00, 10, 2),
(136, '2026-09-11 15:32:11.074270', '2026-01-01', '2026-09-15', 12, 300.00, 20.00, 10, 2),
(137, '2026-09-11 15:32:11.107057', '2026-01-01', '2026-09-15', 3, 1000.00, 20.00, 7, 2),
(138, '2026-09-11 15:32:11.117237', '2026-01-01', '2026-09-15', 6, 1000.00, 20.00, 7, 2),
(139, '2026-09-11 15:32:11.128931', '2026-01-01', '2026-09-15', 9, 1000.00, 20.00, 7, 2),
(140, '2026-09-11 15:32:11.137965', '2026-01-01', '2026-09-15', 12, 1000.00, 20.00, 7, 2),
(141, '2026-09-11 15:32:11.164809', '2026-01-01', '2026-09-15', 3, 350.00, 20.00, 4, 10),
(142, '2026-09-11 15:32:11.172854', '2026-01-01', '2026-09-15', 6, 350.00, 20.00, 4, 10),
(143, '2026-09-11 15:32:11.184628', '2026-01-01', '2026-09-15', 9, 350.00, 20.00, 4, 10),
(144, '2026-09-11 15:32:11.193748', '2026-01-01', '2026-09-15', 12, 350.00, 20.00, 4, 10),
(145, '2026-09-11 15:32:11.212897', '2026-01-01', '2026-09-15', 3, 500.00, 20.00, 6, 10),
(146, '2026-09-11 15:32:11.221715', '2026-01-01', '2026-09-15', 6, 500.00, 20.00, 6, 10),
(147, '2026-09-11 15:32:11.231888', '2026-01-01', '2026-09-15', 9, 500.00, 20.00, 6, 10),
(148, '2026-09-11 15:32:11.242726', '2026-01-01', '2026-09-15', 12, 500.00, 20.00, 6, 10),
(149, '2026-09-16 14:02:25.223739', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 8),
(150, '2026-09-16 14:02:25.248392', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 8),
(151, '2026-09-16 14:02:25.255497', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 8),
(152, '2026-09-16 14:02:25.262479', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 8),
(153, '2026-09-16 14:02:25.270246', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 8),
(154, '2026-09-16 14:02:25.276765', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 8),
(155, '2026-09-16 14:02:25.282579', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 8),
(156, '2026-09-16 14:02:25.288289', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 8),
(157, '2026-09-16 14:02:25.294319', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 8),
(158, '2026-09-16 14:02:25.300633', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 8),
(159, '2026-09-16 14:02:25.307372', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 8),
(160, '2026-09-16 14:02:25.313574', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 8),
(161, '2026-09-16 14:02:25.319207', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 8),
(162, '2026-09-16 14:02:25.324639', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 8),
(163, '2026-09-16 14:02:25.330859', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 8),
(164, '2026-09-16 14:02:25.336497', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 8),
(165, '2026-09-16 14:02:25.341307', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 8),
(166, '2026-09-16 14:02:25.345809', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 8),
(167, '2026-09-16 14:02:25.351232', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 8),
(168, '2026-09-16 14:02:25.356817', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 8),
(169, '2026-09-16 14:02:25.360801', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 8),
(170, '2026-09-16 14:02:25.365465', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 8),
(171, '2026-09-16 14:02:25.369621', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 8),
(172, '2026-09-16 14:02:25.374196', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 8),
(173, '2026-09-16 14:02:25.379946', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 8),
(174, '2026-09-16 14:02:25.385927', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 8),
(175, '2026-09-16 14:02:25.390865', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 8),
(176, '2026-09-16 14:02:25.395626', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 8),
(177, '2026-09-16 14:02:25.441904', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 9),
(178, '2026-09-16 14:02:25.447113', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 9),
(179, '2026-09-16 14:02:25.452211', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 9),
(180, '2026-09-16 14:02:25.457281', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 9),
(181, '2026-09-16 14:02:25.462518', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 9),
(182, '2026-09-16 14:02:25.467685', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 9),
(183, '2026-09-16 14:02:25.473959', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 9),
(184, '2026-09-16 14:02:25.479394', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 9),
(185, '2026-09-16 14:02:25.484078', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 9),
(186, '2026-09-16 14:02:25.489297', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 9),
(187, '2026-09-16 14:02:25.493678', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 9),
(188, '2026-09-16 14:02:25.499204', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 9),
(189, '2026-09-16 14:02:25.503746', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 9),
(190, '2026-09-16 14:02:25.507653', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 9),
(191, '2026-09-16 14:02:25.511297', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 9),
(192, '2026-09-16 14:02:25.515798', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 9),
(193, '2026-09-16 14:02:25.519867', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 9),
(194, '2026-09-16 14:02:25.523700', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 9),
(195, '2026-09-16 14:02:25.527387', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 9),
(196, '2026-09-16 14:02:25.531844', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 9),
(197, '2026-09-16 14:02:25.535390', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 9),
(198, '2026-09-16 14:02:25.539322', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 9),
(199, '2026-09-16 14:02:25.543345', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 9),
(200, '2026-09-16 14:02:25.552721', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 9),
(201, '2026-09-16 14:02:25.556366', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 9),
(202, '2026-09-16 14:02:25.559869', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 9),
(203, '2026-09-16 14:02:25.564248', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 9),
(204, '2026-09-16 14:02:25.568530', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 9),
(205, '2026-09-16 14:02:25.604663', '2026-09-16', NULL, 3, 291.67, 20.00, 6, 2),
(206, '2026-09-16 14:02:25.609406', '2026-09-16', NULL, 6, 291.67, 20.00, 6, 2),
(207, '2026-09-16 14:02:25.614958', '2026-09-16', NULL, 9, 291.67, 20.00, 6, 2),
(208, '2026-09-16 14:02:25.620533', '2026-09-16', NULL, 12, 291.67, 20.00, 6, 2),
(209, '2026-09-16 14:02:25.624905', '2026-09-16', NULL, 3, 250.00, 20.00, 9, 2),
(210, '2026-09-16 14:02:25.630166', '2026-09-16', NULL, 6, 250.00, 20.00, 9, 2),
(211, '2026-09-16 14:02:25.635373', '2026-09-16', NULL, 9, 250.00, 20.00, 9, 2),
(212, '2026-09-16 14:02:25.640926', '2026-09-16', NULL, 12, 250.00, 20.00, 9, 2),
(213, '2026-09-16 14:02:25.647530', '2026-09-16', NULL, 3, 250.00, 20.00, 10, 2),
(214, '2026-09-16 14:02:25.652929', '2026-09-16', NULL, 6, 250.00, 20.00, 10, 2),
(215, '2026-09-16 14:02:25.657975', '2026-09-16', NULL, 9, 250.00, 20.00, 10, 2),
(216, '2026-09-16 14:02:25.665575', '2026-09-16', NULL, 12, 250.00, 20.00, 10, 2),
(217, '2026-09-16 14:02:25.670320', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 2),
(218, '2026-09-16 14:02:25.675420', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 2),
(219, '2026-09-16 14:02:25.680795', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 2),
(220, '2026-09-16 14:02:25.686094', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 2),
(221, '2026-09-16 14:02:25.696127', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 6),
(222, '2026-09-16 14:02:25.701703', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 6),
(223, '2026-09-16 14:02:25.706203', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 6),
(224, '2026-09-16 14:02:25.733048', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 6),
(225, '2026-09-16 14:02:25.737564', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 6),
(226, '2026-09-16 14:02:25.742450', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 6),
(227, '2026-09-16 14:02:25.747473', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 6),
(228, '2026-09-16 14:02:25.752397', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 6),
(229, '2026-09-16 14:02:25.755811', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 6),
(230, '2026-09-16 14:02:25.759079', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 6),
(231, '2026-09-16 14:02:25.762780', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 6),
(232, '2026-09-16 14:02:25.768109', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 6),
(233, '2026-09-16 14:02:25.773155', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 6),
(234, '2026-09-16 14:02:25.777819', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 6),
(235, '2026-09-16 14:02:25.782731', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 6),
(236, '2026-09-16 14:02:25.786635', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 6),
(237, '2026-09-16 14:02:25.790168', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 6),
(238, '2026-09-16 14:02:25.794062', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 6),
(239, '2026-09-16 14:02:25.798620', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 6),
(240, '2026-09-16 14:02:25.802586', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 6),
(241, '2026-09-16 14:02:25.805982', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 6),
(242, '2026-09-16 14:02:25.809512', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 6),
(243, '2026-09-16 14:02:25.813894', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 6),
(244, '2026-09-16 14:02:25.818628', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 6),
(245, '2026-09-16 14:02:25.822729', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 6),
(246, '2026-09-16 14:02:25.826273', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 6),
(247, '2026-09-16 14:02:25.830200', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 6),
(248, '2026-09-16 14:02:25.834004', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 6),
(249, '2026-09-16 14:02:25.840062', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 12),
(250, '2026-09-16 14:02:25.844615', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 12),
(251, '2026-09-16 14:02:25.849334', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 12),
(252, '2026-09-16 14:02:25.854344', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 12),
(253, '2026-09-16 14:02:25.858686', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 12),
(254, '2026-09-16 14:02:25.863605', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 12),
(255, '2026-09-16 14:02:25.867514', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 12),
(256, '2026-09-16 14:02:25.871532', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 12),
(257, '2026-09-16 14:02:25.876422', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 12),
(258, '2026-09-16 14:02:25.882426', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 12),
(259, '2026-09-16 14:02:25.886381', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 12),
(260, '2026-09-16 14:02:25.891419', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 12),
(261, '2026-09-16 14:02:25.896215', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 12),
(262, '2026-09-16 14:02:25.900285', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 12),
(263, '2026-09-16 14:02:25.904724', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 12),
(264, '2026-09-16 14:02:25.910045', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 12),
(265, '2026-09-16 14:02:25.920911', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 12),
(266, '2026-09-16 14:02:25.926188', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 12),
(267, '2026-09-16 14:02:25.932071', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 12),
(268, '2026-09-16 14:02:25.937757', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 12),
(269, '2026-09-16 14:02:25.942611', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 12),
(270, '2026-09-16 14:02:25.947573', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 12),
(271, '2026-09-16 14:02:25.952770', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 12),
(272, '2026-09-16 14:02:25.957675', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 12),
(273, '2026-09-16 14:02:25.962522', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 12),
(274, '2026-09-16 14:02:25.966854', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 12),
(275, '2026-09-16 14:02:25.971345', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 12),
(276, '2026-09-16 14:02:25.975703', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 12),
(277, '2026-09-16 14:02:25.999346', '2026-09-16', NULL, 3, 291.67, 20.00, 4, 10),
(278, '2026-09-16 14:02:26.003452', '2026-09-16', NULL, 6, 291.67, 20.00, 4, 10),
(279, '2026-09-16 14:02:26.007486', '2026-09-16', NULL, 9, 291.67, 20.00, 4, 10),
(280, '2026-09-16 14:02:26.012126', '2026-09-16', NULL, 12, 291.67, 20.00, 4, 10),
(281, '2026-09-16 14:02:26.018400', '2026-09-16', NULL, 3, 416.67, 20.00, 6, 10),
(282, '2026-09-16 14:02:26.021758', '2026-09-16', NULL, 6, 416.67, 20.00, 6, 10),
(283, '2026-09-16 14:02:26.025054', '2026-09-16', NULL, 9, 416.67, 20.00, 6, 10),
(284, '2026-09-16 14:02:26.028541', '2026-09-16', NULL, 12, 416.67, 20.00, 6, 10),
(285, '2026-09-16 14:02:26.034324', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 7),
(286, '2026-09-16 14:02:26.037737', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 7),
(287, '2026-09-16 14:02:26.041287', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 7),
(288, '2026-09-16 14:02:26.045407', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 7),
(289, '2026-09-16 14:02:26.050700', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 7),
(290, '2026-09-16 14:02:26.054377', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 7),
(291, '2026-09-16 14:02:26.058308', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 7),
(292, '2026-09-16 14:02:26.062706', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 7),
(293, '2026-09-16 14:02:26.066728', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 7),
(294, '2026-09-16 14:02:26.070850', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 7),
(295, '2026-09-16 14:02:26.074532', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 7),
(296, '2026-09-16 14:02:26.078335', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 7),
(297, '2026-09-16 14:02:26.082367', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 7),
(298, '2026-09-16 14:02:26.085725', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 7),
(299, '2026-09-16 14:02:26.089878', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 7),
(300, '2026-09-16 14:02:26.093571', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 7),
(301, '2026-09-16 14:02:26.098588', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 7),
(302, '2026-09-16 14:02:26.103267', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 7),
(303, '2026-09-16 14:02:26.108494', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 7),
(304, '2026-09-16 14:02:26.112882', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 7),
(305, '2026-09-16 14:02:26.117139', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 7),
(306, '2026-09-16 14:02:26.120519', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 7),
(307, '2026-09-16 14:02:26.123438', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 7),
(308, '2026-09-16 14:02:26.126117', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 7),
(309, '2026-09-16 14:02:26.130360', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 7),
(310, '2026-09-16 14:02:26.134157', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 7),
(311, '2026-09-16 14:02:26.137773', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 7),
(312, '2026-09-16 14:02:26.141575', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 7),
(313, '2026-09-16 14:02:26.148194', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 13),
(314, '2026-09-16 14:02:26.151677', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 13),
(315, '2026-09-16 14:02:26.155440', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 13),
(316, '2026-09-16 14:02:26.159885', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 13),
(317, '2026-09-16 14:02:26.165525', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 13),
(318, '2026-09-16 14:02:26.169983', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 13),
(319, '2026-09-16 14:02:26.173884', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 13),
(320, '2026-09-16 14:02:26.177057', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 13),
(321, '2026-09-16 14:02:26.181294', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 13),
(322, '2026-09-16 14:02:26.184616', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 13),
(323, '2026-09-16 14:02:26.188184', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 13),
(324, '2026-09-16 14:02:26.191817', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 13),
(325, '2026-09-16 14:02:26.196263', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 13),
(326, '2026-09-16 14:02:26.200682', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 13),
(327, '2026-09-16 14:02:26.204958', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 13),
(328, '2026-09-16 14:02:26.209563', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 13),
(329, '2026-09-16 14:02:26.214119', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 13),
(330, '2026-09-16 14:02:26.218187', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 13),
(331, '2026-09-16 14:02:26.221710', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 13),
(332, '2026-09-16 14:02:26.224753', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 13),
(333, '2026-09-16 14:02:26.227904', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 13),
(334, '2026-09-16 14:02:26.232371', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 13),
(335, '2026-09-16 14:02:26.236383', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 13),
(336, '2026-09-16 14:02:26.240935', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 13),
(337, '2026-09-16 14:02:26.256243', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 13),
(338, '2026-09-16 14:02:26.259792', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 13),
(339, '2026-09-16 14:02:26.263629', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 13),
(340, '2026-09-16 14:02:26.267354', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 13),
(341, '2026-09-16 14:02:26.273799', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 4),
(342, '2026-09-16 14:02:26.279991', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 4),
(343, '2026-09-16 14:02:26.285776', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 4),
(344, '2026-09-16 14:02:26.290679', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 4),
(345, '2026-09-16 14:02:26.295503', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 4),
(346, '2026-09-16 14:02:26.299960', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 4),
(347, '2026-09-16 14:02:26.303561', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 4),
(348, '2026-09-16 14:02:26.306955', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 4),
(349, '2026-09-16 14:02:26.310345', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 4),
(350, '2026-09-16 14:02:26.314735', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 4),
(351, '2026-09-16 14:02:26.318329', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 4),
(352, '2026-09-16 14:02:26.322033', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 4),
(353, '2026-09-16 14:02:26.325789', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 4),
(354, '2026-09-16 14:02:26.329910', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 4),
(355, '2026-09-16 14:02:26.333596', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 4),
(356, '2026-09-16 14:02:26.337042', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 4),
(357, '2026-09-16 14:02:26.340120', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 4),
(358, '2026-09-16 14:02:26.343116', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 4),
(359, '2026-09-16 14:02:26.347350', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 4),
(360, '2026-09-16 14:02:26.351504', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 4),
(361, '2026-09-16 14:02:26.355326', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 4),
(362, '2026-09-16 14:02:26.359535', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 4),
(363, '2026-09-16 14:02:26.364287', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 4),
(364, '2026-09-16 14:02:26.367706', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 4),
(365, '2026-09-16 14:02:26.371195', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 4),
(366, '2026-09-16 14:02:26.374466', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 4),
(367, '2026-09-16 14:02:26.379199', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 4),
(368, '2026-09-16 14:02:26.382354', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 4),
(369, '2026-09-16 14:02:26.418362', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 1),
(370, '2026-09-16 14:02:26.421813', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 1),
(371, '2026-09-16 14:02:26.425095', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 1),
(372, '2026-09-16 14:02:26.429056', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 1),
(373, '2026-09-16 14:02:26.432194', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 1),
(374, '2026-09-16 14:02:26.435109', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 1),
(375, '2026-09-16 14:02:26.438308', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 1),
(376, '2026-09-16 14:02:26.442264', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 1),
(377, '2026-09-16 14:02:26.446493', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 1),
(378, '2026-09-16 14:02:26.449644', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 1),
(379, '2026-09-16 14:02:26.452502', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 1),
(380, '2026-09-16 14:02:26.455387', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 1),
(381, '2026-09-16 14:02:26.458263', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 1),
(382, '2026-09-16 14:02:26.461202', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 1),
(383, '2026-09-16 14:02:26.465408', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 1),
(384, '2026-09-16 14:02:26.468724', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 1),
(385, '2026-09-16 14:02:26.471425', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 1),
(386, '2026-09-16 14:02:26.474443', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 1),
(387, '2026-09-16 14:02:26.478533', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 1),
(388, '2026-09-16 14:02:26.482914', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 1),
(389, '2026-09-16 14:02:26.487180', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 1),
(390, '2026-09-16 14:02:26.491147', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 1),
(391, '2026-09-16 14:02:26.494746', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 1),
(392, '2026-09-16 14:02:26.498786', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 1),
(393, '2026-09-16 14:02:26.502892', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 1),
(394, '2026-09-16 14:02:26.506988', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 1),
(395, '2026-09-16 14:02:26.512543', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 1),
(396, '2026-09-16 14:02:26.517122', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 1),
(397, '2026-09-16 14:02:26.523633', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 5),
(398, '2026-09-16 14:02:26.527173', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 5),
(399, '2026-09-16 14:02:26.532000', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 5),
(400, '2026-09-16 14:02:26.535949', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 5),
(401, '2026-09-16 14:02:26.540125', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 5),
(402, '2026-09-16 14:02:26.543463', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 5),
(403, '2026-09-16 14:02:26.546817', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 5),
(404, '2026-09-16 14:02:26.549826', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 5),
(405, '2026-09-16 14:02:26.553650', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 5),
(406, '2026-09-16 14:02:26.556601', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 5),
(407, '2026-09-16 14:02:26.560905', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 5),
(408, '2026-09-16 14:02:26.564992', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 5),
(409, '2026-09-16 14:02:26.569322', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 5),
(410, '2026-09-16 14:02:26.572976', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 5),
(411, '2026-09-16 14:02:26.576387', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 5),
(412, '2026-09-16 14:02:26.580929', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 5),
(413, '2026-09-16 14:02:26.585008', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 5),
(414, '2026-09-16 14:02:26.588209', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 5),
(415, '2026-09-16 14:02:26.592052', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 5),
(416, '2026-09-16 14:02:26.595996', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 5),
(417, '2026-09-16 14:02:26.600004', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 5),
(418, '2026-09-16 14:02:26.603386', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 5),
(419, '2026-09-16 14:02:26.606479', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 5),
(420, '2026-09-16 14:02:26.609246', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 5),
(421, '2026-09-16 14:02:26.612662', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 5),
(422, '2026-09-16 14:02:26.615707', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 5),
(423, '2026-09-16 14:02:26.618468', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 5),
(424, '2026-09-16 14:02:26.621255', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 5),
(425, '2026-09-16 14:02:26.651901', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 11),
(426, '2026-09-16 14:02:26.654964', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 11),
(427, '2026-09-16 14:02:26.657581', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 11),
(428, '2026-09-16 14:02:26.660276', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 11),
(429, '2026-09-16 14:02:26.664466', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 11),
(430, '2026-09-16 14:02:26.667955', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 11),
(431, '2026-09-16 14:02:26.670617', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 11),
(432, '2026-09-16 14:02:26.672981', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 11),
(433, '2026-09-16 14:02:26.675629', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 11),
(434, '2026-09-16 14:02:26.678125', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 11),
(435, '2026-09-16 14:02:26.681458', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 11),
(436, '2026-09-16 14:02:26.683893', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 11),
(437, '2026-09-16 14:02:26.686028', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 11),
(438, '2026-09-16 14:02:26.688177', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 11),
(439, '2026-09-16 14:02:26.690324', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 11),
(440, '2026-09-16 14:02:26.692262', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 11),
(441, '2026-09-16 14:02:26.694906', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 11),
(442, '2026-09-16 14:02:26.697497', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 11),
(443, '2026-09-16 14:02:26.699786', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 11),
(444, '2026-09-16 14:02:26.701998', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 11),
(445, '2026-09-16 14:02:26.704228', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 11),
(446, '2026-09-16 14:02:26.706512', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 11),
(447, '2026-09-16 14:02:26.724016', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 11),
(448, '2026-09-16 14:02:26.726374', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 11),
(449, '2026-09-16 14:02:26.729872', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 11),
(450, '2026-09-16 14:02:26.732411', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 11),
(451, '2026-09-16 14:02:26.734469', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 11),
(452, '2026-09-16 14:02:26.736636', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 11),
(453, '2026-09-16 14:02:26.751660', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 3),
(454, '2026-09-16 14:02:26.754600', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 3),
(455, '2026-09-16 14:02:26.757853', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 3),
(456, '2026-09-16 14:02:26.760838', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 3),
(457, '2026-09-16 14:02:26.765315', '2026-09-16', NULL, 3, 583.33, 20.00, 8, 3),
(458, '2026-09-16 14:02:26.769833', '2026-09-16', NULL, 6, 583.33, 20.00, 8, 3),
(459, '2026-09-16 14:02:26.773806', '2026-09-16', NULL, 9, 583.33, 20.00, 8, 3),
(460, '2026-09-16 14:02:26.782846', '2026-09-16', NULL, 12, 583.33, 20.00, 8, 3),
(461, '2026-09-16 14:02:26.785900', '2026-09-16', NULL, 3, 225.00, 20.00, 2, 3),
(462, '2026-09-16 14:02:26.789268', '2026-09-16', NULL, 6, 225.00, 20.00, 2, 3),
(463, '2026-09-16 14:02:26.793059', '2026-09-16', NULL, 9, 225.00, 20.00, 2, 3),
(464, '2026-09-16 14:02:26.796747', '2026-09-16', NULL, 12, 225.00, 20.00, 2, 3),
(465, '2026-09-25 11:10:08.636362', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 15),
(466, '2026-09-25 11:10:08.650563', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 15),
(467, '2026-09-25 11:10:08.659771', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 15),
(468, '2026-09-25 11:10:08.668789', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 15),
(469, '2026-09-25 11:10:08.676162', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 15),
(470, '2026-09-25 11:10:08.684102', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 15),
(471, '2026-09-25 11:10:08.692748', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 15),
(472, '2026-09-25 11:10:08.701474', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 15),
(473, '2026-09-25 11:10:08.709665', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 15),
(474, '2026-09-25 11:10:08.719387', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 15),
(475, '2026-09-25 11:10:08.726064', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 15),
(476, '2026-09-25 11:10:08.732292', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 15),
(477, '2026-09-25 11:10:08.739573', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 15),
(478, '2026-09-25 11:10:08.746600', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 15),
(479, '2026-09-25 11:10:08.754912', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 15),
(480, '2026-09-25 11:10:08.761567', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 15),
(481, '2026-09-25 11:10:08.770714', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 15),
(482, '2026-09-25 11:10:08.780200', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 15),
(483, '2026-09-25 11:10:08.788133', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 15),
(484, '2026-09-25 11:10:08.795541', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 15),
(485, '2026-09-25 11:10:08.805383', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 15),
(486, '2026-09-25 11:10:08.814211', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 15),
(487, '2026-09-25 11:10:08.823856', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 15),
(488, '2026-09-25 11:10:08.833816', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 15),
(489, '2026-09-25 11:10:08.841480', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 15),
(490, '2026-09-25 11:10:08.850249', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 15),
(491, '2026-09-25 11:10:08.858826', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 15),
(492, '2026-09-25 11:10:08.866333', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 15),
(493, '2026-09-25 11:10:08.877077', '2026-09-16', NULL, 3, 250.00, 20.00, 1, 14),
(494, '2026-09-25 11:10:08.882909', '2026-09-16', NULL, 6, 250.00, 20.00, 1, 14),
(495, '2026-09-25 11:10:08.890030', '2026-09-16', NULL, 9, 250.00, 20.00, 1, 14),
(496, '2026-09-25 11:10:08.896276', '2026-09-16', NULL, 12, 250.00, 20.00, 1, 14),
(497, '2026-09-25 11:10:08.903160', '2026-09-16', NULL, 3, 291.67, 20.00, 2, 14),
(498, '2026-09-25 11:10:08.909430', '2026-09-16', NULL, 6, 291.67, 20.00, 2, 14),
(499, '2026-09-25 11:10:08.917217', '2026-09-16', NULL, 9, 291.67, 20.00, 2, 14),
(500, '2026-09-25 11:10:08.923517', '2026-09-16', NULL, 12, 291.67, 20.00, 2, 14),
(501, '2026-09-25 11:10:08.932205', '2026-09-16', NULL, 3, 375.00, 20.00, 3, 14),
(502, '2026-09-25 11:10:08.939541', '2026-09-16', NULL, 6, 375.00, 20.00, 3, 14),
(503, '2026-09-25 11:10:08.945866', '2026-09-16', NULL, 9, 375.00, 20.00, 3, 14),
(504, '2026-09-25 11:10:08.953691', '2026-09-16', NULL, 12, 375.00, 20.00, 3, 14),
(505, '2026-09-25 11:10:08.963572', '2026-09-16', NULL, 3, 416.67, 20.00, 4, 14),
(506, '2026-09-25 11:10:08.973050', '2026-09-16', NULL, 6, 416.67, 20.00, 4, 14),
(507, '2026-09-25 11:10:08.979099', '2026-09-16', NULL, 9, 416.67, 20.00, 4, 14),
(508, '2026-09-25 11:10:08.988319', '2026-09-16', NULL, 12, 416.67, 20.00, 4, 14),
(509, '2026-09-25 11:10:08.995639', '2026-09-16', NULL, 3, 458.33, 20.00, 5, 14),
(510, '2026-09-25 11:10:09.005100', '2026-09-16', NULL, 6, 458.33, 20.00, 5, 14),
(511, '2026-09-25 11:10:09.012858', '2026-09-16', NULL, 9, 458.33, 20.00, 5, 14),
(512, '2026-09-25 11:10:09.025184', '2026-09-16', NULL, 12, 458.33, 20.00, 5, 14),
(513, '2026-09-25 11:10:09.034408', '2026-09-16', NULL, 3, 541.67, 20.00, 6, 14),
(514, '2026-09-25 11:10:09.041645', '2026-09-16', NULL, 6, 541.67, 20.00, 6, 14),
(515, '2026-09-25 11:10:09.048402', '2026-09-16', NULL, 9, 541.67, 20.00, 6, 14),
(516, '2026-09-25 11:10:09.056085', '2026-09-16', NULL, 12, 541.67, 20.00, 6, 14),
(517, '2026-09-25 11:10:09.062351', '2026-09-16', NULL, 3, 833.33, 20.00, 7, 14),
(518, '2026-09-25 11:10:09.069828', '2026-09-16', NULL, 6, 833.33, 20.00, 7, 14),
(519, '2026-09-25 11:10:09.076590', '2026-09-16', NULL, 9, 833.33, 20.00, 7, 14),
(520, '2026-09-25 11:10:09.085757', '2026-09-16', NULL, 12, 833.33, 20.00, 7, 14);

-- --------------------------------------------------------

--
-- Table structure for table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` bigint NOT NULL,
  `date_blocage` datetime(6) DEFAULT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_derniere_connexion` datetime(6) DEFAULT NULL,
  `date_modification` datetime(6) NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ACTIF','BLOQUE','DESACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tentatives_connexion_echouees` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `date_blocage`, `date_creation`, `date_derniere_connexion`, `date_modification`, `email`, `mot_de_passe_hash`, `nom`, `prenom`, `statut`, `tentatives_connexion_echouees`) VALUES
(1, NULL, '2026-09-11 15:32:11.949846', NULL, '2026-09-11 15:32:11.949846', 'admin@rrm.ma', '{bcrypt}$2a$10$oqq6LX2ZWIV3o01v1v05IeztJVa5KvkhlC.Fld8Xg3hudnfGRVQVm', 'Administrateur', 'SI', 'DESACTIVE', 0),
(2, NULL, '2026-09-13 00:03:47.856307', NULL, '2026-09-13 00:03:47.856307', 'admin.v1@rrm.ma', '{bcrypt}$2a$10$W2NiDfkrtHl8tjue2qX/Ye4yqyKY52DjRkn8FWEvV30Dmb/OX.iMq', 'Administrateur', 'SI', 'ACTIF', 0),
(3, NULL, '2026-09-14 18:08:06.817871', NULL, '2026-09-14 18:08:06.817871', 'agent.paiement@rrm.ma', '{bcrypt}$2a$10$j47HFBOD97dssi4L7fILv.V8nCep3ot/n9L.PRVXdvv1IoBzJSfMG', 'Agent', 'Paiement', 'ACTIF', 0),
(4, NULL, '2026-09-17 16:50:38.197908', NULL, '2026-09-17 16:50:38.197908', 'superviseur@rrm.ma', '{bcrypt}$2a$10$gAF1FVmCdJYnStEaxqRlKuwAbXNs6cuSgwIzYSEAOtVafIMuklpBe', 'Superviseur', 'RRM', 'ACTIF', 0),
(5, NULL, '2026-09-17 16:50:38.367795', NULL, '2026-09-17 16:50:38.367795', 'responsable@rrm.ma', '{bcrypt}$2a$10$bfZVaVdHOhknILkuvvQvNu.vAXzVRe0NXIGbhOeNFGbVBB60019KK', 'Responsable', 'Stationnement', 'ACTIF', 0),
(6, NULL, '2026-09-25 22:21:56.576519', NULL, '2026-09-25 22:21:56.590244', 'comptable@rrm.ma', '{bcrypt}$2a$10$bfZVaVdHOhknILkuvvQvNu.vAXzVRe0NXIGbhOeNFGbVBB60019KK', 'Comptable', 'RRM', 'ACTIF', 0),
(7, NULL, '2026-09-26 12:28:00.556704', NULL, '2026-09-26 12:28:00.556704', 'agent@rrm.ma', '{bcrypt}$2a$10$DTYxsXBY92VRRqkh8rCmXOysTri2hlXHVXIIxhAvsundMBf6Hbuvm', 'Agent', 'Administratif', 'ACTIF', 0),
(8, NULL, '2026-09-26 12:28:00.659805', NULL, '2026-09-26 12:28:00.659805', 'supervisor@rrm.ma', '{bcrypt}$2a$10$FfudUxVJv3rexoVVMfHepOERrDhs0BTNALsfbUmTQVcgY/QoruQIa', 'Superviseur', 'RRM', 'ACTIF', 0);

-- --------------------------------------------------------

--
-- Table structure for table `utilisateur_role`
--

CREATE TABLE `utilisateur_role` (
  `utilisateur_id` bigint NOT NULL,
  `role_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `utilisateur_role`
--

INSERT INTO `utilisateur_role` (`utilisateur_id`, `role_id`) VALUES
(3, 1),
(7, 1),
(4, 2),
(8, 2),
(5, 3),
(6, 4),
(1, 6),
(2, 6);

-- --------------------------------------------------------

--
-- Table structure for table `vehicule`
--

CREATE TABLE `vehicule` (
  `id` bigint NOT NULL,
  `couleur` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_archivage` datetime(6) DEFAULT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_modification` datetime(6) NOT NULL,
  `immatriculation` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `marque` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modele` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` enum('ACTIF','ARCHIVE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('AUTRE','MOTO','VOITURE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicule`
--

INSERT INTO `vehicule` (`id`, `couleur`, `date_archivage`, `date_creation`, `date_modification`, `immatriculation`, `marque`, `modele`, `statut`, `type`, `client_id`) VALUES
(3, NULL, NULL, '2026-09-12 16:54:42.070087', '2026-09-12 16:54:42.070087', '1444|ب (B)|6', NULL, NULL, 'ACTIF', 'VOITURE', 3),
(4, NULL, NULL, '2026-09-12 22:37:30.782398', '2026-09-12 22:37:30.782398', '12345|أ (A)|1', 'BMW', NULL, 'ACTIF', 'VOITURE', 4),
(5, NULL, NULL, '2026-09-13 11:28:54.954617', '2026-09-13 11:28:54.954617', '12223|أ (A)|3', 'BMW', NULL, 'ACTIF', 'VOITURE', 3),
(6, NULL, NULL, '2026-09-14 19:44:40.776834', '2026-09-14 19:44:40.776834', '12345|أ (A)|57', 'Ferrari', NULL, 'ACTIF', 'VOITURE', 5),
(7, NULL, NULL, '2026-09-15 14:53:34.862168', '2026-09-15 14:53:34.862168', '12348|أ (A)|1', 'Golf 8', NULL, 'ACTIF', 'VOITURE', 7),
(8, NULL, NULL, '2026-09-16 00:14:39.639719', '2026-09-16 00:14:39.639719', '12233|أ (A)|1', 'Mc laren', NULL, 'ACTIF', 'VOITURE', 8),
(9, NULL, NULL, '2026-09-16 00:23:09.025940', '2026-09-16 00:23:09.025940', '12335|أ (A)|1', 'Mercedes CLE 45s Specialfertigung', NULL, 'ACTIF', 'VOITURE', 10),
(10, NULL, NULL, '2026-09-16 11:17:46.992892', '2026-09-16 11:17:46.992892', '33224|أ (A)|1', 'Porshe', NULL, 'ACTIF', 'VOITURE', 11),
(11, NULL, NULL, '2026-09-16 12:57:09.531267', '2026-09-16 12:57:09.531267', '3434|ب|1', 'Dacia Logan 2023', NULL, 'ACTIF', 'VOITURE', 12),
(12, NULL, NULL, '2026-09-16 13:12:53.316039', '2026-09-16 13:12:53.316039', '665323|ل|15', 'Audi Q8', NULL, 'ACTIF', 'VOITURE', 12),
(13, NULL, NULL, '2026-09-16 14:18:17.187652', '2026-09-16 14:18:17.187652', '465|أ|91', 'Pagani', NULL, 'ACTIF', 'VOITURE', 13),
(14, NULL, NULL, '2026-09-16 15:42:44.601570', '2026-09-16 15:42:44.601570', '433344|أ|1', 'Mercedes', NULL, 'ACTIF', 'VOITURE', 14),
(15, NULL, NULL, '2026-09-16 16:00:59.654458', '2026-09-16 16:00:59.654458', '6647|أ|15', 'Rangerover sport', NULL, 'ACTIF', 'VOITURE', 15),
(16, NULL, NULL, '2026-09-19 15:11:16.065671', '2026-09-19 15:11:16.065671', '6555|أ|15', 'Porshe 911 carrera', NULL, 'ACTIF', 'VOITURE', 16),
(17, NULL, NULL, '2026-09-19 17:55:48.851322', '2026-09-19 17:55:48.851322', '5253|أ|25', 'BMW', NULL, 'ACTIF', 'VOITURE', 17),
(18, 'NOIR', NULL, '2026-09-22 16:23:25.382856', '2026-09-22 16:23:25.382856', '111111|أ|1', 'TEST', 'MEDUSE', 'ACTIF', 'VOITURE', 18),
(19, 'GRIS', NULL, '2026-07-23 10:00:00.000000', '2026-07-23 10:00:00.000000', '222222|ب|2', 'TEST', 'THOR', 'ACTIF', 'VOITURE', 19),
(20, 'BLANC', NULL, '2026-09-22 22:49:29.660916', '2026-09-22 22:49:29.660916', '333333|ج|3', 'TEST', 'ZEUS', 'ACTIF', 'VOITURE', 20),
(30, NULL, NULL, '2026-09-25 15:02:51.857979', '2026-09-25 15:02:51.857979', '76876|ه|1', 'BMW', NULL, 'ACTIF', 'VOITURE', 12),
(31, NULL, NULL, '2026-09-26 02:09:25.788517', '2026-09-26 02:09:25.788517', '23213|ط|1', 'BMW', NULL, 'ACTIF', 'VOITURE', 25),
(32, NULL, NULL, '2026-09-26 02:46:32.384297', '2026-09-26 02:46:32.384297', '2332|و|1', 'Mercedes', NULL, 'ACTIF', 'VOITURE', 26),
(33, 'Gris Comète', NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', '45892-A-1', 'Dacia', 'Sandero Stepway', 'ACTIF', 'VOITURE', 27),
(34, 'Blanc Nacré', NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', '18243-B-1', 'Peugeot', '208', 'ACTIF', 'VOITURE', 28),
(35, 'Noir Intense', NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', '76291-A-1', 'Volkswagen', 'Golf 8', 'ACTIF', 'VOITURE', 29),
(36, 'Bleu Iron', NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', '33412-D-1', 'Renault', 'Clio 5', 'ACTIF', 'VOITURE', 30),
(37, 'Rouge Fusion', NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', '61204-A-1', 'Toyota', 'Yaris Hybride', 'ACTIF', 'VOITURE', 31),
(38, 'Gris Foncé', NULL, '2026-09-27 10:06:13.000000', '2026-09-27 10:06:13.000000', '89123-A-1', 'Hyundai', 'Tucson', 'ACTIF', 'VOITURE', 32),
(39, 'Gris Montagne', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '10245-A-1', 'Mercedes-Benz', 'Classe A', 'ACTIF', 'VOITURE', 33),
(40, 'Noir Mythic', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '55231-B-1', 'Audi', 'A3', 'ACTIF', 'VOITURE', 34),
(41, 'Gris Platine', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '88902-A-1', 'Volkswagen', 'Tiguan', 'ACTIF', 'VOITURE', 35),
(42, 'Rouge Désir', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '42109-D-1', 'Seat', 'Ibiza', 'ACTIF', 'VOITURE', 36),
(43, 'Bleu Misano', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '19842-A-1', 'BMW', 'Série 1', 'ACTIF', 'VOITURE', 37),
(44, 'Blanc Nacré', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '67231-A-1', 'Nissan', 'Qashqai', 'ACTIF', 'VOITURE', 38),
(45, 'Gris Acier', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '31094-B-1', 'Kia', 'Sportage', 'ACTIF', 'VOITURE', 39),
(46, 'Bleu Intense', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '74512-A-1', 'Hyundai', 'i20', 'ACTIF', 'VOITURE', 40),
(47, 'Noir Shadow', NULL, '2026-09-27 11:17:24.000000', '2026-09-27 11:17:24.000000', '92014-A-1', 'Ford', 'Focus', 'ACTIF', 'VOITURE', 41);

-- --------------------------------------------------------

--
-- Table structure for table `verification_otp`
--

CREATE TABLE `verification_otp` (
  `id` bigint NOT NULL,
  `canal` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_creation` datetime(6) NOT NULL,
  `date_expiration` datetime(6) NOT NULL,
  `date_validation` datetime(6) DEFAULT NULL,
  `nombre_tentatives` int NOT NULL,
  `statut` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `demande_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `verification_otp`
--

INSERT INTO `verification_otp` (`id`, `canal`, `code_hash`, `date_creation`, `date_expiration`, `date_validation`, `nombre_tentatives`, `statut`, `demande_id`) VALUES
(1, 'EMAIL', '{bcrypt}$2a$10$b5iytRv7yOJ0BpdQjwIkfOcnSvuTRvIee9JwQf0vyZhdVKmxr6e2S', '2026-09-12 16:54:42.267182', '2026-09-12 17:04:42.265184', '2026-09-12 16:55:01.426338', 0, 'VALIDE', 3),
(2, 'EMAIL', '{bcrypt}$2a$10$qIo0oHjHYEPTldaFMQX5w.SsDIzlaVBmpklQdY7zSZugX./z.0rp6', '2026-09-12 22:37:31.326525', '2026-09-12 22:47:31.321424', '2026-09-12 22:37:53.161536', 0, 'VALIDE', 4),
(3, 'EMAIL', '{bcrypt}$2a$10$RJkdm02Jh.KBAxq9ekXIOOFAP/XvzFnEf4T1TmkqWuOiqJQuMLHCK', '2026-09-13 11:28:55.172863', '2026-09-13 11:38:55.171622', '2026-09-13 11:29:13.670982', 0, 'VALIDE', 5),
(4, 'EMAIL', '{bcrypt}$2a$10$edxqFOrehnLjpk68fR0RU.5adXBfcWNeSCB/gj2hB765D8dJiRvL2', '2026-09-14 19:44:41.115751', '2026-09-14 19:54:41.109966', '2026-09-14 19:45:02.833140', 0, 'VALIDE', 6),
(5, 'EMAIL', '{bcrypt}$2a$10$n0zNa1JUyWsKBbFonziOJ.YgUwzqHX1AXz3aEx1.B7zKkHkvtLrdW', '2026-09-15 14:53:46.231933', '2026-09-15 15:03:46.230498', '2026-09-15 14:53:58.931134', 0, 'VALIDE', 7),
(6, 'EMAIL', '{bcrypt}$2a$10$.DMCZNmJE3wbunWxjmHp.ui4XKvvNQ3YPLf/79bBOw676TKXhFGEO', '2026-09-16 00:14:48.826560', '2026-09-16 00:24:48.825294', '2026-09-16 00:15:02.938909', 0, 'VALIDE', 8),
(7, 'EMAIL', '{bcrypt}$2a$10$9Je.LQBmFsbEVvvvaolcY.zgCIFXM2Sl7RCJlxkGjKwJ2LIeum89m', '2026-09-16 00:15:18.657178', '2026-09-16 00:25:18.656871', NULL, 0, 'EN_ATTENTE', 9),
(8, 'EMAIL', '{bcrypt}$2a$10$Vx.EtoTOO4yts5KHy3/2bOkIOtMMUyEaOAv9jI1YYBbYLjfKE62NO', '2026-09-16 00:23:17.361754', '2026-09-16 00:33:17.361423', '2026-09-16 00:23:54.446450', 1, 'VALIDE', 10),
(9, 'EMAIL', '{bcrypt}$2a$10$2Ewsf2CZxRNbZ.Z3WPGFEeFLt2G8XkLRyGsNSEqxrXfnlxPKZJq7u', '2026-09-16 11:17:56.858688', '2026-09-16 11:27:56.857164', '2026-09-16 11:18:15.889411', 0, 'VALIDE', 11),
(10, 'EMAIL', '{bcrypt}$2a$10$5FfaZw6nElj6G7o9e19A.eGWpiVI45SlEtb33zKKEcwG02iymFTLq', '2026-09-16 12:57:21.044318', '2026-09-16 13:07:21.043047', '2026-09-16 12:57:36.419328', 0, 'VALIDE', 12),
(11, 'EMAIL', '{bcrypt}$2a$10$HQQLfR66rcuaBntb9USnbuczlmOCQwDZziJlYuKxN.g6w15kPx7wS', '2026-09-16 13:13:04.486550', '2026-09-16 13:23:04.485485', '2026-09-16 13:14:08.098332', 1, 'VALIDE', 13),
(12, 'EMAIL', '{bcrypt}$2a$10$XfcxQgwAnkMac23LEMnO8ef88dIKZU3GhNnXDrTXfCoe5tquX.Gwq', '2026-09-16 14:18:27.248088', '2026-09-16 14:28:27.246989', '2026-09-16 14:18:44.728995', 0, 'VALIDE', 14),
(13, 'EMAIL', '{bcrypt}$2a$10$mpc6.7CdCHpzjJ.iaX4aYeT10MTD138JLeidWPuh9oEKF87mN2BDG', '2026-09-16 15:42:55.259954', '2026-09-16 15:52:55.258355', '2026-09-16 15:43:10.161585', 0, 'VALIDE', 15),
(14, 'EMAIL', '{bcrypt}$2a$10$9GssvtOmvqNml0wYyvUxpOfNHNZVnc.omEGTedHAjOuLr69CjxePu', '2026-09-16 16:01:09.327441', '2026-09-16 16:11:09.326274', NULL, 0, 'EN_ATTENTE', 16),
(15, 'EMAIL', '{bcrypt}$2a$10$wOqQWayc0lAvXi6mTZP9iuZLfo0mpEYkw77HjX7WZxs2h3DwiEXXO', '2026-09-16 16:05:14.554087', '2026-09-16 16:15:14.553665', '2026-09-16 16:05:35.033338', 0, 'VALIDE', 17),
(16, 'EMAIL', '{bcrypt}$2a$10$y7qLmiAJlH6CetE.TvI9qO2iClwNAtBvQVzujLwJVR/ftX..Btoyy', '2026-09-19 15:11:25.359886', '2026-09-19 15:21:25.358618', '2026-09-19 15:12:04.022040', 0, 'VALIDE', 18),
(17, 'EMAIL', '{bcrypt}$2a$10$zQC9VrPRw0qwQ2.fKIfhDuILhYg6kYshUGSII6iMjwRdWRI..3dAq', '2026-09-19 17:56:00.912744', '2026-09-19 18:06:00.910670', NULL, 0, 'EN_ATTENTE', 19),
(18, 'EMAIL', '{bcrypt}$2a$10$8u5iVsP3xkx0.2BbDglxU.6k6Qkghn4pPgtt8c75ww1VXG7RQMBGG', '2026-09-19 17:56:49.654124', '2026-09-19 18:06:49.653646', NULL, 0, 'EN_ATTENTE', 20),
(19, 'EMAIL', '{bcrypt}$2a$10$EK9ycNIDMTYqCPl.SRbvYOpitjlsT3MTN3PkG.SFbFK3Angrxlowa', '2026-09-19 17:58:03.100983', '2026-09-19 18:08:03.100684', '2026-09-19 17:58:17.713607', 0, 'VALIDE', 21),
(20, 'EMAIL', '{bcrypt}$2a$10$YKIs4W6FZmeOpY4n0xk8R.J5wUFkf4Hw0lUHsJvDONWkrIiHOsr1S', '2026-09-21 00:02:37.605046', '2026-09-21 00:12:37.603128', NULL, 0, 'ANNULE', 22),
(21, 'EMAIL', '{bcrypt}$2a$10$6yJ8sCvAfv3R4N.n3/pxIueIcMVHiXdFGu.0MK97O4fc4.2zoEpRa', '2026-09-21 13:36:51.866111', '2026-09-21 13:46:51.861663', '2026-09-21 13:38:38.695226', 0, 'VALIDE', 22),
(22, 'EMAIL', '{bcrypt}$2a$10$.wdCWneDuz0klnZfZLxIduMOxzvZr7BKVEMeKCcm2syq.JFJiRUjK', '2026-09-21 23:33:33.425047', '2026-09-21 23:43:33.423239', NULL, 0, 'EN_ATTENTE', 23),
(23, 'EMAIL', '{bcrypt}$2a$10$290TNMusiFGMejroorKMH.L1lHxjpxtDEYRcC3amZyzJnd2aCh/6G', '2026-09-22 09:14:58.398198', '2026-09-22 09:24:58.396412', '2026-09-22 09:15:19.352843', 0, 'VALIDE', 24),
(24, 'EMAIL', '{bcrypt}$2a$10$YtTsktl.UefbMvvs.0xKpOeMB.YsnS.dwbrFLe4yjCX3VJZRC25y6', '2026-09-22 15:20:44.725413', '2026-09-22 15:30:44.722594', NULL, 0, 'EN_ATTENTE', 25),
(25, 'EMAIL', '{bcrypt}$2a$10$QB/SpdJTsNt0nc9oBqAuqeDoyMfECKCoBbCcjWK07OAVhAPFTQQnC', '2026-09-22 16:15:29.234101', '2026-09-22 16:25:29.233269', '2026-09-22 16:15:45.286129', 0, 'VALIDE', 29),
(26, 'EMAIL', '{bcrypt}$2a$10$Djlme74RDpOkV1xdw3z2hObYZjPr9Bd.roxQVR6lR7osS3RUPno6y', '2026-09-22 22:40:13.916263', '2026-09-22 22:50:13.913849', '2026-09-22 22:40:30.628212', 0, 'VALIDE', 32),
(27, 'EMAIL', '{bcrypt}$2a$10$KusVFTFV88HkTpig05WMXOxqkPlKehi47JqGCg3DpKlNifWVjLDpa', '2026-09-22 22:51:52.629902', '2026-09-22 23:01:52.629249', '2026-09-22 22:52:02.852573', 0, 'VALIDE', 34),
(28, 'EMAIL', '{bcrypt}$2a$10$kCkwKaGz.ICPNI8LopJZRuZ6sWG8VXaHHw1ajw91fM4jjHo/8UtH2', '2026-09-23 10:31:47.931018', '2026-09-23 10:41:47.929942', '2026-09-23 10:32:03.099685', 0, 'VALIDE', 35),
(29, 'EMAIL', '{bcrypt}$2a$10$VfxazNu65Jqsw9i5NeLqweUd.BV65k1W/FSBY72m4J1UTctJprVhu', '2026-09-23 11:50:55.635902', '2026-09-23 12:00:55.633330', NULL, 1, 'EN_ATTENTE', 36),
(30, 'EMAIL', '{bcrypt}$2a$10$2Gg9Fx5.rIT1QL7YIEFOiePhnAJbHPokt23EwFW3OBdNNSeR.yTta', '2026-09-24 13:01:05.481262', '2026-09-24 13:11:05.479937', '2026-09-24 13:03:08.830248', 0, 'VALIDE', 38),
(31, 'EMAIL', '{bcrypt}$2a$10$0kNtyDjfOGzK2oCnmImh0e6KOlMdV4p8lmlBR3MB8oZnkTWvdxnIq', '2026-09-24 19:49:50.120023', '2026-09-24 19:59:50.118970', '2026-09-24 19:50:05.494788', 0, 'VALIDE', 39),
(32, 'EMAIL', '{bcrypt}$2a$10$VGXEnPkdsnRsF.UaZa.IfO6Lp8pO2H82fr4L22HUkHayKLER558O.', '2026-09-25 09:37:10.251657', '2026-09-25 09:47:10.249989', NULL, 0, 'EN_ATTENTE', 40),
(33, 'EMAIL', '{bcrypt}$2a$10$JyHttU5zwMFBE8uotg8Q7Of28v9aNQOkeJCGfu5j0z10XMD16uL1u', '2026-09-25 09:37:46.439765', '2026-09-25 09:47:46.439290', '2026-09-25 09:38:00.337467', 0, 'VALIDE', 41),
(34, 'EMAIL', '{bcrypt}$2a$10$gL/dT4bWecWTKxgyni6Qn.zcOL2yVjtxFrdg2BXwWkPDm2iYBgGy.', '2026-09-25 15:03:02.120239', '2026-09-25 15:13:02.119310', '2026-09-25 15:03:26.168623', 0, 'VALIDE', 51),
(35, 'EMAIL', '{bcrypt}$2a$10$XmVkp6wpIqW5JMLXqgxrTezc3JaaRAvmEX30f44MiNGt0PNPGUJoW', '2026-09-26 00:38:35.904240', '2026-09-26 00:48:35.902090', NULL, 0, 'EN_ATTENTE', 52),
(36, 'EMAIL', '{bcrypt}$2a$10$gmcsytqqfGNr0ZJ81qy5R.RinnfFLZOEsCzTJCu4JGkRUmKKKWJt.', '2026-09-26 00:38:55.938633', '2026-09-26 00:48:55.938363', '2026-09-26 00:39:10.566352', 0, 'VALIDE', 53),
(37, 'EMAIL', '{bcrypt}$2a$10$2ITZhx4A9tJZWMB8B19rie0L1mjV1ptOIWGI76O9yq2zlw.Oy8KwW', '2026-09-26 02:09:34.261488', '2026-09-26 02:19:34.260188', '2026-09-26 02:09:44.025243', 0, 'VALIDE', 54),
(38, 'EMAIL', '{bcrypt}$2a$10$99HFlaR00jur.4QAqKZSRuw88vaAZt/XwPzJ8d/LRuCuCBf70DXBe', '2026-09-26 02:46:40.651883', '2026-09-26 02:56:40.650738', '2026-09-26 02:47:02.792965', 0, 'VALIDE', 55);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `abonnement`
--
ALTER TABLE `abonnement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_abonnement_reference` (`reference`);

--
-- Indexes for table `abonnement_entreprise`
--
ALTER TABLE `abonnement_entreprise`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK1kv2nk34qb35ndwa9bcubqhpq` (`contrat_corporate_id`);

--
-- Indexes for table `abonnement_entreprise_vehicule`
--
ALTER TABLE `abonnement_entreprise_vehicule`
  ADD UNIQUE KEY `uk_abonnement_entreprise_vehicule` (`abonnement_entreprise_id`,`vehicule_id`),
  ADD KEY `fk_abonnement_entreprise_vehicule_vehicule` (`vehicule_id`);

--
-- Indexes for table `abonnement_regulier`
--
ALTER TABLE `abonnement_regulier`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_abonnement_regulier_client` (`client_particulier_id`);

--
-- Indexes for table `affectation_agent_parking`
--
ALTER TABLE `affectation_agent_parking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_affectation_agent_parking_date` (`utilisateur_id`,`parking_id`,`date_debut`),
  ADD KEY `idx_affectation_agent_active` (`utilisateur_id`,`active`),
  ADD KEY `fk_affectation_agent_parking` (`parking_id`);

--
-- Indexes for table `affectation_parking`
--
ALTER TABLE `affectation_parking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_affectation_parking_abonnement` (`abonnement_regulier_id`),
  ADD KEY `idx_affectation_parking_parking` (`parking_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_log_date` (`date_evenement`),
  ADD KEY `idx_audit_log_acteur` (`acteur_utilisateur_id`),
  ADD KEY `idx_audit_log_action` (`type_action`),
  ADD KEY `idx_audit_log_objet` (`type_objet`,`objet_id`),
  ADD KEY `idx_audit_log_parking` (`parking_id`);

--
-- Indexes for table `carte_acces`
--
ALTER TABLE `carte_acces`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_carte_acces_reference` (`reference`),
  ADD UNIQUE KEY `uk_carte_acces_numero` (`numero_carte`),
  ADD KEY `idx_carte_acces_abonnement` (`abonnement_id`),
  ADD KEY `idx_carte_acces_statut` (`statut`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `client_entreprise`
--
ALTER TABLE `client_entreprise`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_client_entreprise_ice` (`ice`);

--
-- Indexes for table `client_particulier`
--
ALTER TABLE `client_particulier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_client_particulier_cin` (`cin`);

--
-- Indexes for table `contrat_corporate`
--
ALTER TABLE `contrat_corporate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_contrat_corporate_reference` (`reference`),
  ADD KEY `fk_contrat_corporate_client` (`client_entreprise_id`),
  ADD KEY `fk_contrat_corporate_signataire` (`signe_par_utilisateur_id`);

--
-- Indexes for table `demande_changement_parking`
--
ALTER TABLE `demande_changement_parking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKknunipy5utsbf6p4600q2mqh7` (`affectation_generee_id`),
  ADD KEY `fk_changement_parking_abonnement` (`abonnement_concerne_id`),
  ADD KEY `fk_changement_parking_nouveau_parking` (`nouveau_parking_id`);

--
-- Indexes for table `demande_changement_vehicule`
--
ALTER TABLE `demande_changement_vehicule`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKr0hipoi2j7y7hewmjtwoag28w` (`nouveau_vehicule_id`),
  ADD KEY `fk_changement_vehicule_ancien` (`ancien_vehicule_id`);

--
-- Indexes for table `demande_client`
--
ALTER TABLE `demande_client`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_demande_client_reference` (`reference`),
  ADD KEY `fk_demande_client_client` (`client_id`),
  ADD KEY `fk_demande_client_utilisateur` (`initiee_par_utilisateur_id`);

--
-- Indexes for table `demande_corporate_immatriculation`
--
ALTER TABLE `demande_corporate_immatriculation`
  ADD PRIMARY KEY (`demande_id`,`immatriculation`);

--
-- Indexes for table `demande_corporate_vehicule`
--
ALTER TABLE `demande_corporate_vehicule`
  ADD UNIQUE KEY `uk_demande_corporate_vehicule` (`demande_id`,`vehicule_id`),
  ADD KEY `fk_demande_corporate_vehicule_vehicule` (`vehicule_id`);

--
-- Indexes for table `demande_nouveau_contrat_corporate`
--
ALTER TABLE `demande_nouveau_contrat_corporate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKs1i83fq2lerkeb7okubokqgkk` (`contrat_genere_id`),
  ADD UNIQUE KEY `UK63dkb2dyiua9wcck89g4e03wa` (`abonnement_genere_id`),
  ADD UNIQUE KEY `UKdvxdomb5vajq4053pvpygisu9` (`facture_generee_id`),
  ADD UNIQUE KEY `UKh7m48b7gvjjdjuvg9dhl4qdke` (`paiement_corporate_id`),
  ADD KEY `fk_demande_corporate_tarif` (`tarif_parking_id`),
  ADD KEY `fk_demande_corporate_parking` (`parking_id`);

--
-- Indexes for table `demande_nouvel_abonnement_regulier`
--
ALTER TABLE `demande_nouvel_abonnement_regulier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKqmhhplxpprsdlq89c10o1sg3n` (`abonnement_genere_id`),
  ADD KEY `fk_demande_nouvel_abonnement_tarif` (`tarif_parking_id`),
  ADD KEY `fk_demande_nouvel_abonnement_vehicule` (`vehicule_id`);

--
-- Indexes for table `demande_operationnelle`
--
ALTER TABLE `demande_operationnelle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_demande_operationnelle_reference` (`reference`),
  ADD KEY `idx_demande_operationnelle_carte` (`carte_acces_id`),
  ADD KEY `idx_demande_operationnelle_statut` (`statut`),
  ADD KEY `idx_demande_operationnelle_type` (`type_operation`),
  ADD KEY `fk_demande_operationnelle_affectation` (`affectee_a_utilisateur_id`),
  ADD KEY `fk_demande_operationnelle_createur` (`creee_par_utilisateur_id`),
  ADD KEY `fk_demande_operationnelle_declencheuse` (`demande_declencheuse_id`),
  ADD KEY `fk_demande_operationnelle_executeur` (`executee_par_utilisateur_id`),
  ADD KEY `fk_operation_carte_demande_source` (`demande_client_source_id`);

--
-- Indexes for table `demande_renouvellement_regulier`
--
ALTER TABLE `demande_renouvellement_regulier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKfixlkjwfr2e1dve7aqmdcpnar` (`periode_generee_id`),
  ADD KEY `fk_renouvellement_abonnement` (`abonnement_concerne_id`),
  ADD KEY `fk_renouvellement_tarif` (`tarif_parking_id`);

--
-- Indexes for table `facture`
--
ALTER TABLE `facture`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_facture_numero` (`numero`),
  ADD UNIQUE KEY `uk_facture_paiement` (`paiement_id`),
  ADD KEY `idx_facture_statut` (`statut`);

--
-- Indexes for table `forfait`
--
ALTER TABLE `forfait`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_forfait_code` (`code`);

--
-- Indexes for table `historique_statut_demande`
--
ALTER TABLE `historique_statut_demande`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_historique_demande` (`demande_id`),
  ADD KEY `idx_historique_date` (`date_changement`),
  ADD KEY `fk_historique_statut_utilisateur` (`effectue_par_utilisateur_id`);

--
-- Indexes for table `ligne_facture`
--
ALTER TABLE `ligne_facture`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ligne_facture_facture` (`facture_id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_notification_reference` (`reference`),
  ADD KEY `idx_notification_statut` (`statut`),
  ADD KEY `idx_notification_date_prevue` (`date_envoi_prevue`),
  ADD KEY `idx_notification_client` (`client_destinataire_id`),
  ADD KEY `idx_notification_utilisateur` (`utilisateur_destinataire_id`);

--
-- Indexes for table `paiement`
--
ALTER TABLE `paiement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_paiement_reference` (`reference`),
  ADD UNIQUE KEY `UKqh0vg3tvr3xiyksq92g0p03kh` (`periode_abonnement_id`),
  ADD KEY `idx_paiement_demande` (`demande_id`),
  ADD KEY `idx_paiement_statut` (`statut`),
  ADD KEY `fk_paiement_utilisateur` (`traite_par_utilisateur_id`);

--
-- Indexes for table `parking`
--
ALTER TABLE `parking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_parking_code` (`code`);

--
-- Indexes for table `periode_abonnement`
--
ALTER TABLE `periode_abonnement`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_periode_abonnement_numero` (`abonnement_id`,`numero`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_permission_code` (`code`);

--
-- Indexes for table `piece_jointe`
--
ALTER TABLE `piece_jointe`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_piece_jointe_reference` (`reference`),
  ADD UNIQUE KEY `uk_piece_jointe_storage_key` (`storage_key`),
  ADD KEY `idx_piece_jointe_client` (`client_id`),
  ADD KEY `idx_piece_jointe_demande` (`demande_id`),
  ADD KEY `idx_piece_jointe_statut` (`statut`),
  ADD KEY `fk_piece_jointe_deposant` (`deposee_par_utilisateur_id`),
  ADD KEY `fk_piece_jointe_validateur` (`validee_par_utilisateur_id`);

--
-- Indexes for table `plage_acces`
--
ALTER TABLE `plage_acces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_plage_acces_forfait` (`forfait_id`);

--
-- Indexes for table `plage_acces_jour`
--
ALTER TABLE `plage_acces_jour`
  ADD PRIMARY KEY (`plage_acces_id`,`jour_semaine`);

--
-- Indexes for table `recu`
--
ALTER TABLE `recu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_recu_numero` (`numero`),
  ADD UNIQUE KEY `uk_recu_paiement` (`paiement_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_role_code` (`code`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD UNIQUE KEY `uk_role_permission` (`role_id`,`permission_id`),
  ADD KEY `fk_role_permission_permission` (`permission_id`);

--
-- Indexes for table `tarif_parking`
--
ALTER TABLE `tarif_parking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_tarif_parking_forfait_duree_date` (`parking_id`,`forfait_id`,`duree_en_mois`,`date_debut_validite`),
  ADD KEY `fk_tarif_parking_forfait` (`forfait_id`);

--
-- Indexes for table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_utilisateur_email` (`email`);

--
-- Indexes for table `utilisateur_role`
--
ALTER TABLE `utilisateur_role`
  ADD UNIQUE KEY `uk_utilisateur_role` (`utilisateur_id`,`role_id`),
  ADD KEY `fk_utilisateur_role_role` (`role_id`);

--
-- Indexes for table `vehicule`
--
ALTER TABLE `vehicule`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_vehicule_immatriculation` (`immatriculation`),
  ADD KEY `fk_vehicule_client` (`client_id`);

--
-- Indexes for table `verification_otp`
--
ALTER TABLE `verification_otp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_verification_otp_demande` (`demande_id`),
  ADD KEY `idx_verification_otp_expiration` (`date_expiration`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `abonnement`
--
ALTER TABLE `abonnement`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `affectation_agent_parking`
--
ALTER TABLE `affectation_agent_parking`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `affectation_parking`
--
ALTER TABLE `affectation_parking`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `carte_acces`
--
ALTER TABLE `carte_acces`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `contrat_corporate`
--
ALTER TABLE `contrat_corporate`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `demande_client`
--
ALTER TABLE `demande_client`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `demande_operationnelle`
--
ALTER TABLE `demande_operationnelle`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `facture`
--
ALTER TABLE `facture`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `forfait`
--
ALTER TABLE `forfait`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `historique_statut_demande`
--
ALTER TABLE `historique_statut_demande`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `ligne_facture`
--
ALTER TABLE `ligne_facture`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `paiement`
--
ALTER TABLE `paiement`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `parking`
--
ALTER TABLE `parking`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `periode_abonnement`
--
ALTER TABLE `periode_abonnement`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `piece_jointe`
--
ALTER TABLE `piece_jointe`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `plage_acces`
--
ALTER TABLE `plage_acces`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recu`
--
ALTER TABLE `recu`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tarif_parking`
--
ALTER TABLE `tarif_parking`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=521;

--
-- AUTO_INCREMENT for table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `vehicule`
--
ALTER TABLE `vehicule`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `verification_otp`
--
ALTER TABLE `verification_otp`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `abonnement_entreprise`
--
ALTER TABLE `abonnement_entreprise`
  ADD CONSTRAINT `fk_abonnement_entreprise_contrat` FOREIGN KEY (`contrat_corporate_id`) REFERENCES `contrat_corporate` (`id`),
  ADD CONSTRAINT `FKbbgo0o0fmee2y080cu276cuvs` FOREIGN KEY (`id`) REFERENCES `abonnement` (`id`);

--
-- Constraints for table `abonnement_entreprise_vehicule`
--
ALTER TABLE `abonnement_entreprise_vehicule`
  ADD CONSTRAINT `fk_abonnement_entreprise_vehicule_abonnement` FOREIGN KEY (`abonnement_entreprise_id`) REFERENCES `abonnement_entreprise` (`id`),
  ADD CONSTRAINT `fk_abonnement_entreprise_vehicule_vehicule` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicule` (`id`);

--
-- Constraints for table `abonnement_regulier`
--
ALTER TABLE `abonnement_regulier`
  ADD CONSTRAINT `fk_abonnement_regulier_client` FOREIGN KEY (`client_particulier_id`) REFERENCES `client_particulier` (`id`),
  ADD CONSTRAINT `FKlgxpqxv693fm8p66af7awriwy` FOREIGN KEY (`id`) REFERENCES `abonnement` (`id`);

--
-- Constraints for table `affectation_agent_parking`
--
ALTER TABLE `affectation_agent_parking`
  ADD CONSTRAINT `fk_affectation_agent_parking` FOREIGN KEY (`parking_id`) REFERENCES `parking` (`id`),
  ADD CONSTRAINT `fk_affectation_agent_utilisateur` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `affectation_parking`
--
ALTER TABLE `affectation_parking`
  ADD CONSTRAINT `fk_affectation_parking_abonnement` FOREIGN KEY (`abonnement_regulier_id`) REFERENCES `abonnement_regulier` (`id`),
  ADD CONSTRAINT `fk_affectation_parking_parking` FOREIGN KEY (`parking_id`) REFERENCES `parking` (`id`);

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `fk_audit_log_parking` FOREIGN KEY (`parking_id`) REFERENCES `parking` (`id`),
  ADD CONSTRAINT `fk_audit_log_utilisateur` FOREIGN KEY (`acteur_utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `carte_acces`
--
ALTER TABLE `carte_acces`
  ADD CONSTRAINT `fk_carte_acces_abonnement` FOREIGN KEY (`abonnement_id`) REFERENCES `abonnement` (`id`);

--
-- Constraints for table `client_entreprise`
--
ALTER TABLE `client_entreprise`
  ADD CONSTRAINT `FK96s6c69ecw5wif21dg7cnpe0l` FOREIGN KEY (`id`) REFERENCES `client` (`id`);

--
-- Constraints for table `client_particulier`
--
ALTER TABLE `client_particulier`
  ADD CONSTRAINT `FKsm91fij9wb23nnm7x3wvytuho` FOREIGN KEY (`id`) REFERENCES `client` (`id`);

--
-- Constraints for table `contrat_corporate`
--
ALTER TABLE `contrat_corporate`
  ADD CONSTRAINT `fk_contrat_corporate_client` FOREIGN KEY (`client_entreprise_id`) REFERENCES `client_entreprise` (`id`),
  ADD CONSTRAINT `fk_contrat_corporate_signataire` FOREIGN KEY (`signe_par_utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `demande_changement_parking`
--
ALTER TABLE `demande_changement_parking`
  ADD CONSTRAINT `fk_changement_parking_abonnement` FOREIGN KEY (`abonnement_concerne_id`) REFERENCES `abonnement_regulier` (`id`),
  ADD CONSTRAINT `fk_changement_parking_affectation` FOREIGN KEY (`affectation_generee_id`) REFERENCES `affectation_parking` (`id`),
  ADD CONSTRAINT `fk_changement_parking_demande` FOREIGN KEY (`id`) REFERENCES `demande_client` (`id`),
  ADD CONSTRAINT `fk_changement_parking_nouveau_parking` FOREIGN KEY (`nouveau_parking_id`) REFERENCES `parking` (`id`);

--
-- Constraints for table `demande_changement_vehicule`
--
ALTER TABLE `demande_changement_vehicule`
  ADD CONSTRAINT `fk_changement_vehicule_ancien` FOREIGN KEY (`ancien_vehicule_id`) REFERENCES `vehicule` (`id`),
  ADD CONSTRAINT `fk_changement_vehicule_demande` FOREIGN KEY (`id`) REFERENCES `demande_client` (`id`),
  ADD CONSTRAINT `fk_changement_vehicule_nouveau` FOREIGN KEY (`nouveau_vehicule_id`) REFERENCES `vehicule` (`id`);

--
-- Constraints for table `demande_client`
--
ALTER TABLE `demande_client`
  ADD CONSTRAINT `fk_demande_client_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  ADD CONSTRAINT `fk_demande_client_utilisateur` FOREIGN KEY (`initiee_par_utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `demande_corporate_immatriculation`
--
ALTER TABLE `demande_corporate_immatriculation`
  ADD CONSTRAINT `FKojy8oor28xrkpb24s9u601ng1` FOREIGN KEY (`demande_id`) REFERENCES `demande_nouveau_contrat_corporate` (`id`);

--
-- Constraints for table `demande_corporate_vehicule`
--
ALTER TABLE `demande_corporate_vehicule`
  ADD CONSTRAINT `fk_demande_corporate_vehicule_demande` FOREIGN KEY (`demande_id`) REFERENCES `demande_nouveau_contrat_corporate` (`id`),
  ADD CONSTRAINT `fk_demande_corporate_vehicule_vehicule` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicule` (`id`);

--
-- Constraints for table `demande_nouveau_contrat_corporate`
--
ALTER TABLE `demande_nouveau_contrat_corporate`
  ADD CONSTRAINT `fk_demande_corporate_abonnement` FOREIGN KEY (`abonnement_genere_id`) REFERENCES `abonnement_entreprise` (`id`),
  ADD CONSTRAINT `fk_demande_corporate_contrat` FOREIGN KEY (`contrat_genere_id`) REFERENCES `contrat_corporate` (`id`),
  ADD CONSTRAINT `fk_demande_corporate_demande` FOREIGN KEY (`id`) REFERENCES `demande_client` (`id`),
  ADD CONSTRAINT `fk_demande_corporate_facture` FOREIGN KEY (`facture_generee_id`) REFERENCES `facture` (`id`),
  ADD CONSTRAINT `fk_demande_corporate_paiement` FOREIGN KEY (`paiement_corporate_id`) REFERENCES `paiement` (`id`),
  ADD CONSTRAINT `fk_demande_corporate_parking` FOREIGN KEY (`parking_id`) REFERENCES `parking` (`id`),
  ADD CONSTRAINT `fk_demande_corporate_tarif` FOREIGN KEY (`tarif_parking_id`) REFERENCES `tarif_parking` (`id`);

--
-- Constraints for table `demande_nouvel_abonnement_regulier`
--
ALTER TABLE `demande_nouvel_abonnement_regulier`
  ADD CONSTRAINT `fk_demande_nouvel_abonnement_genere` FOREIGN KEY (`abonnement_genere_id`) REFERENCES `abonnement_regulier` (`id`),
  ADD CONSTRAINT `fk_demande_nouvel_abonnement_tarif` FOREIGN KEY (`tarif_parking_id`) REFERENCES `tarif_parking` (`id`),
  ADD CONSTRAINT `fk_demande_nouvel_abonnement_vehicule` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicule` (`id`),
  ADD CONSTRAINT `FKiyceouppl4fwqun422irm6y61` FOREIGN KEY (`id`) REFERENCES `demande_client` (`id`);

--
-- Constraints for table `demande_operationnelle`
--
ALTER TABLE `demande_operationnelle`
  ADD CONSTRAINT `fk_demande_operationnelle_affectation` FOREIGN KEY (`affectee_a_utilisateur_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `fk_demande_operationnelle_carte` FOREIGN KEY (`carte_acces_id`) REFERENCES `carte_acces` (`id`),
  ADD CONSTRAINT `fk_demande_operationnelle_createur` FOREIGN KEY (`creee_par_utilisateur_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `fk_demande_operationnelle_declencheuse` FOREIGN KEY (`demande_declencheuse_id`) REFERENCES `demande_operationnelle` (`id`),
  ADD CONSTRAINT `fk_demande_operationnelle_executeur` FOREIGN KEY (`executee_par_utilisateur_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `fk_operation_carte_demande_source` FOREIGN KEY (`demande_client_source_id`) REFERENCES `demande_client` (`id`);

--
-- Constraints for table `demande_renouvellement_regulier`
--
ALTER TABLE `demande_renouvellement_regulier`
  ADD CONSTRAINT `fk_renouvellement_abonnement` FOREIGN KEY (`abonnement_concerne_id`) REFERENCES `abonnement_regulier` (`id`),
  ADD CONSTRAINT `fk_renouvellement_demande` FOREIGN KEY (`id`) REFERENCES `demande_client` (`id`),
  ADD CONSTRAINT `fk_renouvellement_periode` FOREIGN KEY (`periode_generee_id`) REFERENCES `periode_abonnement` (`id`),
  ADD CONSTRAINT `fk_renouvellement_tarif` FOREIGN KEY (`tarif_parking_id`) REFERENCES `tarif_parking` (`id`);

--
-- Constraints for table `facture`
--
ALTER TABLE `facture`
  ADD CONSTRAINT `fk_facture_paiement` FOREIGN KEY (`paiement_id`) REFERENCES `paiement` (`id`);

--
-- Constraints for table `historique_statut_demande`
--
ALTER TABLE `historique_statut_demande`
  ADD CONSTRAINT `fk_historique_statut_demande` FOREIGN KEY (`demande_id`) REFERENCES `demande_client` (`id`),
  ADD CONSTRAINT `fk_historique_statut_utilisateur` FOREIGN KEY (`effectue_par_utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `ligne_facture`
--
ALTER TABLE `ligne_facture`
  ADD CONSTRAINT `fk_ligne_facture_facture` FOREIGN KEY (`facture_id`) REFERENCES `facture` (`id`);

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `fk_notification_client` FOREIGN KEY (`client_destinataire_id`) REFERENCES `client` (`id`),
  ADD CONSTRAINT `fk_notification_utilisateur` FOREIGN KEY (`utilisateur_destinataire_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `paiement`
--
ALTER TABLE `paiement`
  ADD CONSTRAINT `fk_paiement_demande` FOREIGN KEY (`demande_id`) REFERENCES `demande_client` (`id`),
  ADD CONSTRAINT `fk_paiement_periode` FOREIGN KEY (`periode_abonnement_id`) REFERENCES `periode_abonnement` (`id`),
  ADD CONSTRAINT `fk_paiement_utilisateur` FOREIGN KEY (`traite_par_utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `periode_abonnement`
--
ALTER TABLE `periode_abonnement`
  ADD CONSTRAINT `fk_periode_abonnement_abonnement` FOREIGN KEY (`abonnement_id`) REFERENCES `abonnement` (`id`);

--
-- Constraints for table `piece_jointe`
--
ALTER TABLE `piece_jointe`
  ADD CONSTRAINT `fk_piece_jointe_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  ADD CONSTRAINT `fk_piece_jointe_demande` FOREIGN KEY (`demande_id`) REFERENCES `demande_client` (`id`),
  ADD CONSTRAINT `fk_piece_jointe_deposant` FOREIGN KEY (`deposee_par_utilisateur_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `fk_piece_jointe_validateur` FOREIGN KEY (`validee_par_utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `plage_acces`
--
ALTER TABLE `plage_acces`
  ADD CONSTRAINT `fk_plage_acces_forfait` FOREIGN KEY (`forfait_id`) REFERENCES `forfait` (`id`);

--
-- Constraints for table `plage_acces_jour`
--
ALTER TABLE `plage_acces_jour`
  ADD CONSTRAINT `FK6qkdjd8d7mdum3ussev557uky` FOREIGN KEY (`plage_acces_id`) REFERENCES `plage_acces` (`id`);

--
-- Constraints for table `recu`
--
ALTER TABLE `recu`
  ADD CONSTRAINT `fk_recu_paiement` FOREIGN KEY (`paiement_id`) REFERENCES `paiement` (`id`);

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `fk_role_permission_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`),
  ADD CONSTRAINT `fk_role_permission_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `tarif_parking`
--
ALTER TABLE `tarif_parking`
  ADD CONSTRAINT `fk_tarif_parking_forfait` FOREIGN KEY (`forfait_id`) REFERENCES `forfait` (`id`),
  ADD CONSTRAINT `fk_tarif_parking_parking` FOREIGN KEY (`parking_id`) REFERENCES `parking` (`id`);

--
-- Constraints for table `utilisateur_role`
--
ALTER TABLE `utilisateur_role`
  ADD CONSTRAINT `fk_utilisateur_role_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `fk_utilisateur_role_utilisateur` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Constraints for table `vehicule`
--
ALTER TABLE `vehicule`
  ADD CONSTRAINT `fk_vehicule_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`);

--
-- Constraints for table `verification_otp`
--
ALTER TABLE `verification_otp`
  ADD CONSTRAINT `fk_verification_otp_demande` FOREIGN KEY (`demande_id`) REFERENCES `demande_client` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
