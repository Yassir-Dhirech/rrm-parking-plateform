export type Role = "AGENT" | "SUPERVISEUR" | "RESPONSABLE" | "COMPTABLE" | "RESP_REPORTING" | "ADMIN_SI";

interface MenuItem {
  key: string;
  label: string;
  path: string;
}

interface RoleConfig {
  homePath: string;
  title: string;
  menuItems: MenuItem[];
  kpis: string[];
}

export const roleConfig: Record<Role, RoleConfig> = {
  AGENT: {
    homePath: "/agent",
    title: "Espace Agent",
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/agent" },
      { key: "demandes", label: "Demandes", path: "/agent/demandes" },
    ],
    kpis: ["Demandes en attente", "Demandes traitées aujourd'hui"],
  },
  SUPERVISEUR: {
    homePath: "/superviseur",
    title: "Espace Superviseur",
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/superviseur" },
      { key: "demandes", label: "Demandes", path: "/superviseur/demandes" },
      { key: "abonnements", label: "Abonnements", path: "/superviseur/abonnements" },
      { key: "cartes", label: "Cartes d'accès", path: "/superviseur/cartes" },
    ],
    kpis: ["Cartes à activer", "Factures à générer", "Recette hebdo"],
  },
  RESPONSABLE: {
    homePath: "/responsable",
    title: "Espace Responsable",
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/responsable" },
      { key: "factures", label: "Factures à signer", path: "/responsable/factures" },
      { key: "contrats", label: "Contrats", path: "/responsable/contrats" },
    ],
    kpis: ["Factures à signer", "Contrats à valider"],
  },
  COMPTABLE: {
    homePath: "/comptable",
    title: "Espace Comptable",
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/comptable" },
      { key: "paiements", label: "Paiements", path: "/comptable/paiements" },
      { key: "factures", label: "Factures", path: "/comptable/factures" },
    ],
    kpis: ["Paiements en attente", "Factures à traiter"],
  },
  RESP_REPORTING: {
    homePath: "/reporting",
    title: "Espace Reporting",
    menuItems: [
      { key: "dashboard", label: "Statistiques", path: "/reporting" },
    ],
    kpis: ["Demandes par type", "Recette mensuelle", "Taux de satisfaction"],
  },
  ADMIN_SI: {
    homePath: "/admin",
    title: "Espace Administration",
    menuItems: [
      { key: "utilisateurs", label: "Utilisateurs", path: "/admin/utilisateurs" },
      { key: "parkings", label: "Parkings", path: "/admin/parkings" },
      { key: "tarifs", label: "Plans tarifaires", path: "/admin/tarifs" },
      { key: "logs", label: "Logs d'audit", path: "/admin/logs" },
    ],
    kpis: ["Utilisateurs actifs", "Demandes traitées", "Erreurs système"],
  },
};