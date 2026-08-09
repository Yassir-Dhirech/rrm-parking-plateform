# Structure des dossiers — RRM Parking Platform

Ce document décrit précisément où se trouve chaque type de fichier dans le projet, et où en ajouter de nouveaux. À utiliser comme référence exacte pour savoir "où placer quoi".

---

## Structure globale du repo

```
rrm-parking-platform/
├── backend/     → Spring Boot (Java), géré par le binôme
└── frontend/    → React + TypeScript, mon périmètre
```

---

## FRONTEND — `frontend/src/`

```
src/
├── api/
├── features/
├── layouts/
├── pages/
├── components/
│   ├── ui/
│   └── forms/
├── context/
├── routes/
├── lib/
├── styles/
└── main.tsx
```

### `src/api/` — tous les appels HTTP vers le backend

Un fichier par domaine métier. Chaque fichier exporte des fonctions `async` qui utilisent `client` (l'instance Axios centrale définie dans `api/client.ts`).

**Fichiers existants** :
- `client.ts` — instance Axios centrale (URL de base, intercepteur JWT, gestion des erreurs 401). Ne jamais dupliquer ailleurs.
- `auth.ts` — `login()`
- `parkings.ts` — `getPublicParkings()`
- `demandes.ts` — `submitPublicDemande()`
- `demandesMock.ts`, `abonnementsMock.ts`, `paiementsMock.ts`, `facturesMock.ts`, `cartesMock.ts` — données factices temporaires, à supprimer/remplacer une fois les vrais endpoints backend prêts.

**Où ajouter un nouveau fichier** : chaque nouveau domaine métier (Contrats, Recettes, Utilisateurs, etc.) doit avoir son propre fichier ici, ex. `contrats.ts`, `recettes.ts`. Ne jamais mélanger les appels de deux domaines dans un même fichier.

### `src/features/{domaine}/` — la vraie logique métier, organisée par domaine, PAS par rôle

C'est le dossier le plus important du projet. Chaque sous-dossier correspond à un domaine métier complet (pas à un rôle).

**Structure type d'un domaine** (exemple avec `demandes`) :
```
features/demandes/
├── types.ts           → interfaces TypeScript (ex: DemandeListItem, DemandeDetail)
└── pages/
    ├── DemandesList.tsx
    ├── DemandeDetail.tsx
    └── PublicQrForm.tsx   (cas spécial : formulaire public, pas de rôle)
```

**Domaines existants** : `auth/`, `demandes/`, `abonnements/`, `paiements/`, `factures/`, `cartes/`

**Domaines à créer plus tard** : `contrats/`, `recettes/`, `utilisateurs/` (admin), `tarifs/` (admin), `logs/` (admin)

**Règle absolue** : si une fonctionnalité concerne un objet métier du modèle de données (Demande, Abonnement, Paiement, Facture, Carte, Contrat, Recette, Utilisateur, Parking, PlanTarifaire), elle va dans `features/{nom-du-domaine}/`. Ne jamais créer `features/agent/` ou `features/superviseur/` — le rôle ne doit jamais structurer les dossiers, seulement des conditions à l'intérieur des composants (`if (role === "AGENT")`).

**Si un domaine a besoin de composants réutilisables juste pour lui** (ex: un formulaire spécifique aux paiements réutilisé dans plusieurs pages du domaine paiements), créer `features/paiements/components/`.

### `src/layouts/`

- `RoleLayout.tsx` — l'unique shell visuel (sidebar + topbar) partagé par les 6 rôles internes. Lit le rôle connecté et va chercher sa configuration dans `lib/roleConfig.ts`.
- `RoleLayout.css` — styles associés.

**Ne jamais créer** un layout par rôle (`AgentLayout.tsx`, etc.) — c'était une erreur corrigée tôt dans le projet, un seul layout générique suffit pour tous.

### `src/pages/` — pages autonomes, sans domaine métier propre

- `LandingPage.tsx` + `.css` — page d'accueil publique
- `Dashboard.tsx` — tableau de bord générique, un seul composant pour les 6 rôles, lit ses indicateurs depuis `roleConfig`
- `Unauthorized.tsx` — page d'erreur accès refusé
- `NotFound.tsx` — page 404

**Où ajouter quoi ici** : uniquement des pages qui n'ont pas de logique métier propre (pas de types, pas d'appels API dédiés). Si une page commence à avoir besoin de ses propres types/API, elle doit être déplacée/recréée dans `features/`.

### `src/components/ui/` — composants visuels génériques, réutilisés partout

- `StatusBadge.tsx` — badge de statut coloré, gère TOUS les enums de statut du projet (Demande, Abonnement, Paiement, Facture, Carte) dans un seul composant générique via un type union.
- `PublicNavbar.tsx` + `.css` — barre de navigation de la landing page publique.

**Où ajouter quoi ici** : tout composant visuel sans logique métier, utilisé dans au moins deux endroits différents (boutons custom, tableaux génériques, indicateurs de chargement, etc.).

### `src/components/forms/` — actuellement vide, prévu pour plus tard

Pour des morceaux de formulaires réutilisés dans plusieurs features (ex: un bloc de champs "informations paiement" utilisé à la fois dans la création et la modification d'un paiement).

### `src/context/`

- `AuthContext.tsx` — état global de connexion (token, rôle, nom d'utilisateur), fonctions `login()`/`logout()`.

**Où ajouter quoi ici** : uniquement de l'état vraiment global partagé par toute l'application (pas de state local de formulaire, ça reste dans le composant avec `useState`).

### `src/routes/`

- `ProtectedRoute.tsx` — vérifie l'authentification et le rôle avant d'afficher une page.
- `router.tsx` — définit TOUTES les routes de l'application. Génère dynamiquement les routes par rôle à partir de `roleConfig`, avec des conditions supplémentaires (`extraRoutes`) pour les routes spécifiques à certains rôles.

**Où modifier quoi** : chaque nouvelle page/feature nécessite une ligne d'import + une entrée dans `router.tsx`. C'est le point central obligatoire de toute nouvelle fonctionnalité.

### `src/lib/` — configuration technique, pas de composants visuels

- `queryClient.ts` — configuration globale de React Query
- `enums.ts` — types TypeScript miroir des enums backend (`TypeClient`, `TypeVehicule`, `ModePaiement`...) + objets de libellés français associés
- `roleConfig.ts` — LE fichier central : pour chaque rôle, son titre, son chemin d'accueil, ses éléments de menu (avec chemins réels), ses indicateurs de tableau de bord.

**Où ajouter quoi ici** : toute configuration partagée qui n'est ni un composant ni un appel API. Un nouvel enum métier va dans `enums.ts`. Un changement de menu/sidebar va dans `roleConfig.ts`.

### `src/styles/`

- `theme.css` — variables CSS globales (couleurs, espacements, police), importé une seule fois dans `main.tsx`.

### `main.tsx` — point d'entrée

Assemble tous les providers globaux : `QueryClientProvider`, `AuthProvider`, `ConfigProvider` (thème Ant Design), `RouterProvider`. Importe aussi `theme.css` et le CSS reset d'Ant Design.

---

## Convention CSS

- Un fichier `.css` classique par composant, situé dans le même dossier que le composant (`MonComposant.tsx` + `MonComposant.css`).
- Pas de CSS Modules (décision volontaire, pour rester simple).
- Chaque classe est préfixée par le nom du composant en kebab-case pour éviter toute collision (ex: `navbar-logo`, `landing-hero`, `sidebar-account`).

---

## Convention de nommage des fichiers

- Composants React : `PascalCase.tsx` (ex: `DemandesList.tsx`)
- Fichiers utilitaires/config : `camelCase.ts` (ex: `roleConfig.ts`, `queryClient.ts`)
- CSS : même nom que le composant associé (ex: `RoleLayout.css` pour `RoleLayout.tsx`)

---

## Le schéma répété pour CHAQUE nouvelle fonctionnalité métier

Quand on ajoute un nouveau domaine (ex: Contrats), l'ordre exact est :

1. `src/features/contrats/types.ts` — définir les interfaces
2. `src/api/contratsMock.ts` (temporaire) puis `src/api/contrats.ts` (réel) — fonctions d'appel
3. Si un nouvel enum de statut existe → l'ajouter dans `src/components/ui/StatusBadge.tsx` (union de types + les deux `Record`)
4. `src/features/contrats/pages/ContratsList.tsx` — page liste (`useQuery` + `Table` Ant Design)
5. `src/features/contrats/pages/ContratDetail.tsx` — page détail (`Descriptions` + actions conditionnées par rôle/statut)
6. `src/routes/router.tsx` — importer les deux pages, ajouter les routes dans la logique `extraRoutes` selon les rôles autorisés
7. `src/lib/roleConfig.ts` — ajouter l'entrée de menu pour chaque rôle concerné

Ce schéma est identique pour Demandes, Abonnements, Paiements, Factures, Cartes déjà construits — le suivre exactement pour toute nouvelle fonctionnalité garantit zéro duplication et une structure cohérente.

---

## BACKEND — `backend/src/main/java/com/rrm/parking/`

*(Géré par mon binôme, structure de référence à suivre)*

```
com/rrm/parking/
├── entity/         → classes représentant les tables (Parking, Utilisateur...)
├── repository/     → interfaces JpaRepository, une par entité
├── service/        → logique métier, une classe par entité/domaine
├── controller/     → endpoints REST, un par entité/domaine
├── security/        → JwtService, JwtAuthFilter, SecurityConfig
├── dto/             → objets d'échange (LoginRequest, LoginResponse...)
```

**Dossiers à créer au fur et à mesure** : `enums/` (enums Java correspondant aux ENUM SQL), `config/` (config générale type CORS).

**Schéma répété pour chaque nouvelle entité backend** : Entity → Repository → Service (`@Transactional` sur les écritures) → Controller (`@RestController`) — exactement le modèle déjà posé avec `Parking`.

### `backend/src/main/resources/db/migration/`

Fichiers SQL Flyway, numérotés dans l'ordre (`V1__init_schema.sql`, `V2__seed_admin_user.sql`, puis `V3__...`, etc.). Ne jamais modifier un fichier de migration déjà appliqué — toujours créer un nouveau fichier `Vx__` pour tout changement de schéma.
