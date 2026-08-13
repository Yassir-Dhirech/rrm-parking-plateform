import { type Role } from "../lib/roleConfig";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "info" | "warning" | "success" | "danger";
  read: boolean;
  link?: string;
  targetRole: Role;
}

const initialNotifications: AppNotification[] = [
  // AGENT
  {
    id: "notif-1",
    title: "Nouvelles Demandes en Attente",
    message: "3 nouvelles demandes d'abonnement nécessitent un traitement initial.",
    timestamp: "Il y a 10 min",
    type: "warning",
    read: false,
    link: "/agent/demandes",
    targetRole: "AGENT",
  },
  {
    id: "notif-2",
    title: "Cartes physiques prêtes",
    message: "2 cartes d'accès sont en attente d'impression/remise au guichet.",
    timestamp: "Il y a 1 heure",
    type: "info",
    read: false,
    link: "/agent/cartes",
    targetRole: "AGENT",
  },

  // SUPERVISEUR
  {
    id: "notif-3",
    title: "Recette Hebdomadaire à Valider",
    message: "La recette de la Semaine 32 pour Parking Agdal Gare (32 400 MAD) attend votre validation.",
    timestamp: "Il y a 25 min",
    type: "warning",
    read: false,
    link: "/superviseur/recettes",
    targetRole: "SUPERVISEUR",
  },
  {
    id: "notif-4",
    title: "Nouveaux Abonnements à Réviser",
    message: "5 demandes d'abonnement validées attendent l'émission du contrat.",
    timestamp: "Il y a 2 heures",
    type: "info",
    read: true,
    link: "/superviseur/abonnements",
    targetRole: "SUPERVISEUR",
  },

  // RESPONSABLE
  {
    id: "notif-5",
    title: "Contrat à Signer",
    message: "Le contrat de renouvellement grand compte (Société Atlas Trans) attend votre signature finale.",
    timestamp: "Il y a 45 min",
    type: "warning",
    read: false,
    link: "/responsable/contrats",
    targetRole: "RESPONSABLE",
  },
  {
    id: "notif-6",
    title: "Objectif Mensuel Atteint",
    message: "Le chiffre d'affaires du Parking Bab El Had a dépassé les prévisions de 12%.",
    timestamp: "Hier à 17:30",
    type: "success",
    read: true,
    link: "/responsable/factures",
    targetRole: "RESPONSABLE",
  },

  // COMPTABLE
  {
    id: "notif-7",
    title: "Encaissement à Rapprocher",
    message: "Un virement bancaire de 18 500 MAD n'a pas encore été associé à une facture.",
    timestamp: "Il y a 30 min",
    type: "danger",
    read: false,
    link: "/comptable/paiements",
    targetRole: "COMPTABLE",
  },
  {
    id: "notif-8",
    title: "Bilan Hebdomadaire Disponible",
    message: "La synthèse des encaissements par TPE et espèces de la semaine a été générée.",
    timestamp: "Aujourd'hui à 09:00",
    type: "info",
    read: false,
    link: "/comptable/factures",
    targetRole: "COMPTABLE",
  },

  // RESP_REPORTING
  {
    id: "notif-9",
    title: "Rapport Hebdomadaire Prêt",
    message: "Le rapport d'occupation globale des 17 parkings est disponible pour analyse.",
    timestamp: "Il y a 15 min",
    type: "info",
    read: false,
    link: "/reporting",
    targetRole: "RESP_REPORTING",
  },

  // ADMIN_SI
  {
    id: "notif-10",
    title: "Alerte Sécurité - Tentatives de Connexion",
    message: "Multiple tentatives de connexion échouées détectées pour l'utilisateur agent.nord.",
    timestamp: "Il y a 5 min",
    type: "danger",
    read: false,
    link: "/admin/logs",
    targetRole: "ADMIN_SI",
  },
  {
    id: "notif-11",
    title: "Mise à Jour Système",
    message: "Le schéma de base de données Flyway V8 a été appliqué avec succès par l'équipe backend.",
    timestamp: "Aujourd'hui à 08:30",
    type: "success",
    read: true,
    link: "/admin/parkings",
    targetRole: "ADMIN_SI",
  },
];

let currentNotifications = [...initialNotifications];

export async function getNotificationsForRole(role: Role): Promise<AppNotification[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return currentNotifications.filter((n) => n.targetRole === role);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  currentNotifications = currentNotifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
}

export async function markAllNotificationsAsReadForRole(role: Role): Promise<void> {
  currentNotifications = currentNotifications.map((n) =>
    n.targetRole === role ? { ...n, read: true } : n
  );
}
