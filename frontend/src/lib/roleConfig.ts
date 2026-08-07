export type Role = "AGENT" 
| "SUPERVISEUR" | "RESPONSABLE" |
 "COMPTABLE" | "RESP_REPORTING" |
  "ADMIN_SI";

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
    kpis: ["Demandes en attente", "Demandes traitées aujourd'hui"],
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/agent" },
      { key: "demandes", label: "Demandes", path: "/agent/demandes" },
      { key: "paiements", label: "Paiements", path: "/agent/paiements" },
    ],
  },
  SUPERVISEUR: {
    homePath: "/superviseur",
    title: "Espace Superviseur",
    kpis: ["Cartes à activer", "Factures à générer", "Recette hebdo"],
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/superviseur" },
      { key: "demandes", label: "Demandes", path: "/superviseur/demandes" },
      { key: "abonnements", label: "Abonnements", path: "/superviseur/abonnements" },
      { key: "paiements", label: "Paiements", path: "/superviseur/paiements" },
      { key: "factures", label: "Factures", path: "/superviseur/factures" },
    ],
  },
  RESPONSABLE: {
    homePath: "/responsable",
    title: "Espace Responsable",
    kpis: ["Factures à signer", "CA mensuel", "Abonnements expirant"],
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/responsable" },
      { key: "demandes", label: "Demandes", path: "/responsable/demandes" },
      { key: "abonnements", label: "Abonnements", path: "/responsable/abonnements" },
      { key: "factures", label: "Factures", path: "/responsable/factures" },
    ],
  },
  COMPTABLE: {
    homePath: "/comptable",
    title: "Espace Comptable",
    kpis: ["Paiements du jour", "Recette hebdo"],
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/comptable" },
      { key: "paiements", label: "Paiements", path: "/comptable/paiements" },
      { key: "factures", label: "Factures", path: "/comptable/factures" },
    ],
  },
  RESP_REPORTING: {
    homePath: "/reporting",
    title: "Espace Reporting",
    kpis: ["Abonnements actifs", "CA total"],
    menuItems: [
      { key: "dashboard", label: "Statistiques", path: "/reporting" },
    ],
  },
  ADMIN_SI: {
    homePath: "/admin",
    title: "Espace Administration",
    kpis: [],
    menuItems: [
      { key: "utilisateurs", label: "Utilisateurs", path: "/admin/utilisateurs" },
      { key: "parkings", label: "Parkings", path: "/admin/parkings" },
      { key: "tarifs", label: "Plans tarifaires", path: "/admin/tarifs" },
      { key: "logs", label: "Logs d'audit", path: "/admin/logs" },
    ],
  },
};