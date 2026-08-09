# RRM Parking Platform

Plateforme web de gestion des abonnements de parking pour **Rabat Région Mobilité (RRM)**, opérateur public de mobilité urbaine gérant 17 parkings dans la région Rabat-Salé-Témara.

> Projet de stage de fin d'études (binôme) — 3 mois, juin-septembre 2026.

---

## Sommaire

- [Contexte métier](#contexte-métier)
- [Rôles et permissions](#rôles-et-permissions)
- [Stack technique](#stack-technique)
- [Structure du repo](#structure-du-repo)
- [Installation et lancement](#installation-et-lancement)
- [État d'avancement](#état-davancement)
- [Conventions de code](#conventions-de-code)
- [Roadmap](#roadmap)

---

## Contexte métier

La gestion actuelle des abonnements de parking chez RRM repose sur des processus manuels (papier, Excel, outils déconnectés). Cette plateforme centralise l'intégralité du cycle de vie des abonnements pour le personnel interne de RRM.

**Le client n'a pas de compte** : il soumet sa demande via un **formulaire public accessible par QR code** (`/demande-publique`). Tout le traitement se fait ensuite en interne.

### Flux métier principal

```
Demande soumise (QR code)
   → Vérification par un AGENT
   → Enregistrement du paiement
   → Génération de la facture
   → Signature par le RESPONSABLE
   → Préparation de la carte d'accès
   → Activation par le SUPERVISEUR (système externe)
   → Notification au client
```

### Types d'abonnement

- **Régulier** : client particulier, 1 véhicule, plan tarifaire fixe (3/6/9/12 mois)
- **Corporate** : entreprise, plusieurs véhicules, contrat négocié

---

## Rôles et permissions

| Rôle | Responsabilités principales |
|---|---|
| `AGENT` | Traitement des demandes, saisie des paiements, consultation des cartes |
| `SUPERVISEUR` | Vue globale, gestion des abonnements/contrats/factures, activation des cartes, recettes hebdomadaires |
| `RESPONSABLE` | Signature des factures et des contrats corporate, vision globale des 17 parkings |
| `COMPTABLE` | Suivi financier, factures, recettes |
| `RESP_REPORTING` | Tableaux de bord et statistiques |
| `ADMIN_SI` | Administration (utilisateurs, parkings, tarifs, logs d'audit) |
| Client | Externe, aucun compte, formulaire public uniquement |

La matrice complète des permissions (qui peut valider/signer/activer quoi) est appliquée au niveau des composants frontend (conditions sur rôle + statut) et sera reproduite côté backend via Spring Security.

---

## Stack technique

### Backend (`backend/`)
- **Spring Boot** (Java 23), Maven
- **MySQL** + **Flyway** (migrations versionnées, 25 tables)
- **Spring Security + JWT** pour l'authentification
- Architecture en couches : Entity → Repository → Service → Controller

### Frontend (`frontend/`)
- **React 18** + **TypeScript**, bundlé avec **Vite**
- **Ant Design** (composants UI)
- **React Router v6** (routage)
- **TanStack React Query** (fetching/cache des données)
- **Axios** (client HTTP)
- CSS classique par composant (pas de CSS Modules), classes préfixées par composant

### Environnement local
- **XAMPP** (Apache + MySQL + phpMyAdmin) pour la base de données locale
- Chaque développeur a sa propre base de données locale ; le schéma est partagé via les migrations Flyway versionnées dans Git

---

## Structure du repo

```
rrm-parking-platform/
├── backend/                          → API Spring Boot
│   └── src/main/java/com/rrm/parking/
│       ├── entity/                   → entités JPA (tables)
│       ├── repository/               → accès base de données
│       ├── service/                  → logique métier
│       ├── controller/               → endpoints REST
│       ├── security/                 → JWT, config Spring Security
│       └── dto/                      → objets d'échange API
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/             → scripts Flyway (V1, V2, ...)
│
└── frontend/                         → Application React
    └── src/
        ├── api/                      → appels HTTP (1 fichier par domaine)
        ├── features/                 → logique métier PAR DOMAINE (pas par rôle)
        │   ├── demandes/
        │   ├── abonnements/
        │   ├── paiements/
        │   ├── factures/
        │   ├── cartes/
        │   ├── contrats/
        │   └── auth/
        ├── components/
        │   ├── ui/                   → composants partagés (StatusBadge, Navbar...)
        │   └── forms/
        ├── layouts/                  → RoleLayout (un seul, partagé par tous les rôles)
        ├── pages/                    → pages sans domaine métier propre
        ├── routes/                   → router.tsx, ProtectedRoute.tsx
        ├── lib/                      → roleConfig.ts, enums.ts, queryClient.ts
        ├── context/                  → AuthContext.tsx
        └── styles/                   → theme.css
```

**Règle architecturale centrale** : le dossier `features/` est organisé **par domaine métier** (Demandes, Paiements, Factures...), jamais par rôle. Un même composant sert plusieurs rôles ; seules les actions visibles changent, via des conditions simples (`role === "RESPONSABLE"`). Voir [`STRUCTURE.md`](./STRUCTURE.md) pour le détail fichier par fichier.

---

## Installation et lancement

### Prérequis
- JDK 21+ (`JAVA_HOME` configuré)
- Node.js LTS
- XAMPP (Apache + MySQL)
- Git

### 1. Cloner le repo
```bash
git clone https://github.com/Yassir-Dhirech/rrm-parking-plateform.git
cd rrm-parking-plateform
```

### 2. Base de données
1. Démarrer Apache + MySQL dans XAMPP
2. Créer une base `rrm_parking` via phpMyAdmin (`localhost/phpmyadmin`)

### 3. Backend
```bash
cd backend
.\mvnw spring-boot:run
```
Flyway applique automatiquement les migrations au démarrage (schéma + utilisateur admin de test).

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
Application disponible sur `http://localhost:5173`.

### Comptes de test (mode développement)

En développement (`npm run dev`), la page de connexion affiche des **boutons de connexion rapide** pour chaque rôle (visibles uniquement en dev, invisibles en production) — permet de tester chaque espace sans dépendre du backend.

Compte admin réel (une fois le backend d'authentification actif) :
```
email: admin@rrm.ma
mot de passe: admin123
```

---

## État d'avancement

### Backend
- [x] Schéma de base de données complet (25 tables, Flyway)
- [x] Authentification Spring Security + JWT (`POST /api/auth/login`)
- [x] Endpoint CRUD de référence (`Parking`)
- [ ] Endpoints métier (Demandes, Abonnements, Paiements, Factures, Cartes, Contrats)
- [ ] Endpoints publics (parkings, soumission de demande)

### Frontend
- [x] Authentification, routage protégé par rôle, layout partagé
- [x] Page d'accueil publique + formulaire QR multi-étapes
- [x] Module **Demandes** (liste, détail, valider/rejeter)
- [x] Module **Abonnements** (liste, détail)
- [x] Module **Paiements** (liste, détail)
- [x] Module **Factures** (liste, détail, signature)
- [x] Module **Cartes d'accès** (liste, détail, activation)
- [x] Module **Contrats** (liste, détail, signature, véhicules rattachés)
- [ ] Module **Recettes**
- [ ] Écrans **Administration** (utilisateurs, parkings, tarifs, logs)
- [ ] Filtres globaux sur les tableaux (parking, statut, période)
- [ ] KPIs réels sur les tableaux de bord
- [ ] Bascule des données factices (`*Mock.ts`) vers les vrais endpoints backend

Toutes les fonctionnalités frontend utilisent actuellement des **données factices** (`src/api/*Mock.ts`) en attendant que les endpoints backend correspondants soient prêts. Le remplacement se fait fichier par fichier sans changer la structure des pages.

---

## Conventions de code

- **Composants** : fonctions nommées exportées (`export function MaPage() {}`), jamais d'export par défaut anonyme.
- **Un domaine métier = un dossier** sous `features/`, jamais un dossier par rôle.
- **Statuts** : gérés par un unique composant `<StatusBadge statut={...} />`, avec un type union `AnyStatut` couvrant tous les enums — toute nouvelle valeur doit être ajoutée aux deux `Record` (couleurs + libellés) sous peine d'erreur TypeScript.
- **Navigation dans les tableaux** : clic sur une ligne (`onRow`) avec chemin calculé dynamiquement via `roleConfig[role].homePath`, jamais de chemin en dur.
- **CSS** : un fichier `.css` par composant, classes préfixées par le nom du composant en kebab-case.
- **Backend** : Entity → Repository → Service (`@Transactional`) → Controller, verrouillage optimiste (`@Version`) sur les entités multi-acteurs, transitions de statut via méthodes métier nommées uniquement.

Voir [`STRUCTURE.md`](./STRUCTURE.md) pour le détail complet dossier par dossier et le schéma exact à suivre pour ajouter une nouvelle fonctionnalité.

---

## Roadmap

1. Module Recettes (génération hebdomadaire par le superviseur, consultation comptable)
2. Écrans Administration (CRUD utilisateurs/parkings/tarifs, logs d'audit)
3. Filtres globaux sur les listes (parking, statut, période)
4. KPIs réels sur les tableaux de bord
5. Connexion progressive des endpoints backend, remplacement des données factices
6. Décision et mise en place du déploiement (cloud ou serveur local avec DDNS)

---

## Équipe

- **Frontend** : Yassir Dhirech
- **Backend** : [binôme]
- **Encadrante** : Mme Asmae Moustaine

## Licence

Projet académique — usage interne et pédagogique, propriété de Rabat Région Mobilité.
