export type Role = "AGENT"
  | "SUPERVISEUR" | "RESPONSABLE" |
  "COMPTABLE" | "RESP_REPORTING" |
  "ADMIN_SI";

export interface KpiItem {
  key: string;
  title: string;
  color?: string;
  suffix?: string;
}

interface MenuItem {
  key: string;
  label: string;
  path: string;
}

interface RoleConfig {
  homePath: string;
  title: string;
  menuItems: MenuItem[];
  kpis: KpiItem[];
}

export const roleConfig: Record<Role, RoleConfig> = {
  AGENT: {
    homePath: "/agent",
    title: "Espace Agent",
    kpis: [
      { key: "demandesSoumises", title: "Demandes à Encaisser Guichet", color: "#d97706" },
      { key: "encaissementsJour", title: "Encaissements Guichet (Aujourd'hui)", color: "#10b981", suffix: "DH" },
      { key: "cartesADelivrer", title: "Cartes d'Accès à Délivrer", color: "#2563eb" },
      { key: "demandesTraitees", title: "Demandes Traitées Aujourd'hui", color: "#003566" },
    ],
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/agent" },
      { key: "carte-parkings", label: "Carte des Parkings", path: "/agent/carte-parkings" },
      { key: "demandes", label: "Demandes", path: "/agent/demandes" },
      { key: "cartes", label: "Cartes d'accès", path: "/agent/cartes" },
    ],
  },
  SUPERVISEUR: {
    homePath: "/superviseur",
    title: "Espace Superviseur",
    kpis: [
      { key: "dossiersValider", title: "Dossiers à Valider (Conformité)", color: "#2563eb" },
      { key: "recettesValider", title: "Recettes Hebdo à Valider", color: "#d97706" },
      { key: "cartesActiver", title: "Cartes d'Accès à Activer", color: "#982B5E" },
      { key: "tauxConformite", title: "Taux de Conformité Dossiers", color: "#10b981", suffix: "%" },
    ],
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/superviseur" },
      { key: "carte-parkings", label: "Carte des Parkings", path: "/superviseur/carte-parkings" },
      { key: "demandes", label: "Demandes", path: "/superviseur/demandes" },
      { key: "abonnements", label: "Abonnements", path: "/superviseur/abonnements" },
      { key: "recettes", label: "Recettes Hebdo", path: "/superviseur/recettes" },
      { key: "factures", label: "Factures", path: "/superviseur/factures" },
      { key: "cartes", label: "Cartes d'accès", path: "/superviseur/cartes" },
    ],
  },
  RESPONSABLE: {
    homePath: "/responsable",
    title: "Espace Responsable",
    kpis: [
      { key: "caMensuel", title: "CA Mensuel Cumulé", color: "#003566", suffix: "DH" },
      { key: "contratsSigner", title: "Contrats Corporate à Signer", color: "#982B5E" },
      { key: "tauxOccupation", title: "Taux d'Occupation Global", color: "#10b981", suffix: "%" },
      { key: "parkingsExploitation", title: "Parkings en Exploitation", color: "#2563eb" },
    ],
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/responsable" },
      { key: "carte-parkings", label: "Carte des Parkings", path: "/responsable/carte-parkings" },
      { key: "parkings", label: "Gestion Parkings", path: "/responsable/parkings" },
      { key: "tarifs", label: "Plans Tarifaires", path: "/responsable/tarifs" },
      { key: "demandes", label: "Demandes", path: "/responsable/demandes" },
      { key: "abonnements", label: "Abonnements", path: "/responsable/abonnements" },
      { key: "recettes", label: "Recettes Hebdo", path: "/responsable/recettes" },
      { key: "contrats", label: "Contrats Corporate", path: "/responsable/contrats" },
      { key: "factures", label: "Factures", path: "/responsable/factures" },
    ],
  },
  COMPTABLE: {
    homePath: "/comptable",
    title: "Espace Comptable",
    kpis: [
      { key: "encaissementsJour", title: "Encaissements du Jour", color: "#10b981", suffix: "DH" },
      { key: "facturesRetard", title: "Factures en Retard / À Recouvrer", color: "#ef4444" },
      { key: "recettesRapprocher", title: "Recettes à Rapprocher", color: "#d97706" },
      { key: "chequesCaisse", title: "Montant Chèques en Caisse", color: "#003566", suffix: "DH" },
    ],
    menuItems: [
      { key: "dashboard", label: "Tableau de bord", path: "/comptable" },
      { key: "carte-parkings", label: "Carte des Parkings", path: "/comptable/carte-parkings" },
      { key: "recettes", label: "Recettes Hebdo (Versement)", path: "/comptable/recettes" },
      { key: "factures", label: "Factures", path: "/comptable/factures" },
    ],
  },
  RESP_REPORTING: {
    homePath: "/reporting",
    title: "Espace Reporting",
    kpis: [
      { key: "tauxRemplissage", title: "Taux de Remplissage Global", color: "#003566", suffix: "%" },
      { key: "caTotal", title: "CA Total Cumulé", color: "#10b981", suffix: "DH" },
      { key: "abonnesActifs", title: "Abonnés Actifs Total", color: "#2563eb" },
      { key: "tauxRenouvellement", title: "Taux de Renouvellement", color: "#982B5E", suffix: "%" },
    ],
    menuItems: [
      { key: "dashboard", label: "Statistiques", path: "/reporting" },
      { key: "carte-parkings", label: "Carte des Parkings", path: "/reporting/carte-parkings" },
    ],
  },
  ADMIN_SI: {
    homePath: "/admin",
    title: "Espace Administration",
    kpis: [
      { key: "evenementsAudit", title: "Événements d'Audit (24h)", color: "#3b82f6" },
      { key: "comptesActifs", title: "Comptes Utilisateurs Actifs", color: "#10b981" },
      { key: "parkingsConfigures", title: "Parkings Configurés", color: "#003566" },
      { key: "disponibiliteSysteme", title: "Disponibilité Système", color: "#10b981", suffix: "%" },
    ],
    menuItems: [
      { key: "carte-parkings", label: "Carte des Parkings", path: "/admin/carte-parkings" },
      { key: "utilisateurs", label: "Utilisateurs", path: "/admin/utilisateurs" },
      { key: "parkings", label: "Parkings", path: "/admin/parkings" },
      { key: "tarifs", label: "Plans tarifaires", path: "/admin/tarifs" },
      { key: "logs", label: "Logs d'audit", path: "/admin/logs" },
    ],
  },
};