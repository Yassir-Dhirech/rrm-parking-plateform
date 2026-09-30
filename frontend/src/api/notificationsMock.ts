import { type Role } from "../lib/roleConfig";
import { getAgentActions } from "./agentDashboard";
import { listerRejetsCheques } from "./rejetsChequesApi";
import client from "./client";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt?: string | null;
  type: "info" | "warning" | "success" | "danger";
  category?: "PAIEMENT" | "DOSSIER" | "RECETTES" | "SYSTEME";
  read: boolean;
  link?: string;
  targetRole: Role;
}

const initialNotifications: AppNotification[] = [
  // RESPONSABLE
  {
    id: "notif-5",
    title: "Contrat Corporate à Signer",
    message: "Le contrat de renouvellement grand compte (Société Atlas Trans) attend votre signature.",
    timestamp: "Il y a 45 min",
    type: "warning",
    category: "DOSSIER",
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
    category: "RECETTES",
    read: true,
    link: "/responsable/factures",
    targetRole: "RESPONSABLE",
  },

  // COMPTABLE
  {
    id: "notif-7",
    title: "Encaissement à Rapprocher",
    message: "Un règlement par chèque de 18 500 MAD n'a pas encore été associé à une facture.",
    timestamp: "Il y a 30 min",
    type: "danger",
    category: "PAIEMENT",
    read: false,
    link: "/comptable/recettes",
    targetRole: "COMPTABLE",
  },
  {
    id: "notif-8",
    title: "Bilan Hebdomadaire Disponible",
    message: "La synthèse des encaissements par TPE et espèces de la semaine a été générée.",
    timestamp: "Aujourd'hui à 09:00",
    type: "info",
    category: "RECETTES",
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
    category: "SYSTEME",
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
    category: "SYSTEME",
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
    category: "SYSTEME",
    read: true,
    link: "/admin/parkings",
    targetRole: "ADMIN_SI",
  },
];

let currentNotifications = [...initialNotifications];

interface NotificationSuperviseurApi {
  id: string;
  title: string;
  message: string;
  createdAt: string | null;
  type: AppNotification["type"];
  category: AppNotification["category"];
  read: boolean;
  link: string;
}

async function notificationsSuperviseur(): Promise<AppNotification[]> {
  const { data } = await client.get<NotificationSuperviseurApi[]>("/superviseur/notifications");
  return data.map((notification) => ({
    ...notification,
    timestamp: notification.createdAt
      ? new Intl.DateTimeFormat("fr-MA", { dateStyle: "short", timeStyle: "short" })
          .format(new Date(notification.createdAt))
      : "Date indisponible",
    targetRole: "SUPERVISEUR" as const,
  }));
}

type EtatAgent = Record<string, "lu" | "masque">;

function cleEtatAgent(): string {
  try {
    const token = localStorage.getItem("token") ?? "";
    const contenu = JSON.parse(atob(token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/")));
    return `rrm-agent-notifications-${contenu.userId ?? contenu.sub}`;
  } catch {
    return "rrm-agent-notifications-session";
  }
}

function lireEtatAgent(): EtatAgent {
  try { return JSON.parse(localStorage.getItem(cleEtatAgent()) ?? "{}"); }
  catch { return {}; }
}

function enregistrerEtatAgent(ids: string[], etat: "lu" | "masque") {
  const prochain = lireEtatAgent();
  ids.forEach((id) => { prochain[id] = etat; });
  localStorage.setItem(cleEtatAgent(), JSON.stringify(prochain));
}

async function notificationsAgent(): Promise<AppNotification[]> {
  const [actions, dossiers] = await Promise.all([getAgentActions(200), listerRejetsCheques()]);
  const etat = lireEtatAgent();
  const date = (valeur?: string | null) => valeur
    ? new Intl.DateTimeFormat("fr-MA", { dateStyle: "short", timeStyle: "short" }).format(new Date(valeur))
    : "Date indisponible";
  const notifications: AppNotification[] = actions.actions.map((action) => {
    const type = action.type;
    const id = `agent:${type}:${action.id}`;
    const titres = { PAIEMENT: "Demande en attente de paiement", IMPRESSION: "Demande d’impression", REMISE: "Carte à remettre" };
    const messages = {
      PAIEMENT: `La demande ${action.reference} de ${action.nomClient ?? "ce client"} attend son paiement.`,
      IMPRESSION: `La carte liée à ${action.reference} doit être imprimée.`,
      REMISE: `La carte liée à ${action.reference} est prête à être remise.`,
    };
    return { id, title: titres[type], message: messages[type], timestamp: date(action.depuis), createdAt: action.depuis,
      type: action.enRetard ? "warning" as const : "info" as const,
      category: type === "PAIEMENT" ? "PAIEMENT" as const : "DOSSIER" as const,
      read: etat[id] === "lu", link: action.lien, targetRole: "AGENT" as const };
  });
  dossiers.filter((dossier) => dossier.statut === "BLOQUE").forEach((dossier) => {
    const id = `agent:BLOQUE:${dossier.id}`;
    notifications.push({ id, title: "Abonnement bloqué : paiement attendu",
      message: `${dossier.clientNom} · ${dossier.referenceAbonnement} · ${dossier.montantInitialTtc.toLocaleString("fr-MA")} MAD à régulariser.`,
      timestamp: date(dossier.dateBlocageCartes ?? dossier.dateDecision ?? dossier.dateDeclaration),
      createdAt: dossier.dateBlocageCartes ?? dossier.dateDecision ?? dossier.dateDeclaration,
      type: "warning", category: "PAIEMENT", read: etat[id] === "lu",
      link: "/agent/rejets-cheques", targetRole: "AGENT" });
  });
  return notifications.filter((notification) => etat[notification.id] !== "masque")
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

export async function getNotificationsForRole(role: Role): Promise<AppNotification[]> {
  if (role === "AGENT") return notificationsAgent();
  if (role === "SUPERVISEUR") return notificationsSuperviseur();
  if (role === "RESPONSABLE") {
    const response = await client.get<Array<Omit<AppNotification, "timestamp" | "targetRole">>>(
      "/responsable/cartes-corporate/echeances/notifications");
    return response.data.map((item) => ({ ...item, targetRole: "RESPONSABLE" as const,
      timestamp: item.createdAt ? new Date(item.createdAt).toLocaleString("fr-FR") : "—" }));
  }
  await new Promise((resolve) => setTimeout(resolve, 150));
  return currentNotifications.filter((n) => n.targetRole === role);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (id.startsWith("agent:")) { enregistrerEtatAgent([id], "lu"); return; }
  if (id.startsWith("resp:corp:")) {
    await client.post(`/responsable/cartes-corporate/echeances/notifications/${encodeURIComponent(id)}/lecture`);
    return;
  }
  if (id.startsWith("superviseur:")) {
    await client.post(`/superviseur/notifications/${encodeURIComponent(id)}/lecture`);
    return;
  }
  currentNotifications = currentNotifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
}

export async function markAllNotificationsAsReadForRole(role: Role): Promise<void> {
  if (role === "AGENT") { enregistrerEtatAgent((await notificationsAgent()).map((n) => n.id), "lu"); return; }
  if (role === "RESPONSABLE") { await client.post("/responsable/cartes-corporate/echeances/notifications/lecture-totale"); return; }
  if (role === "SUPERVISEUR") { await client.post("/superviseur/notifications/lecture-totale"); return; }
  currentNotifications = currentNotifications.map((n) =>
    n.targetRole === role ? { ...n, read: true } : n
  );
}

export async function deleteNotificationMock(id: string): Promise<void> {
  if (id.startsWith("agent:")) { enregistrerEtatAgent([id], "masque"); return; }
  if (id.startsWith("resp:corp:")) {
    await client.delete(`/responsable/cartes-corporate/echeances/notifications/${encodeURIComponent(id)}`);
    return;
  }
  if (id.startsWith("superviseur:")) {
    await client.delete(`/superviseur/notifications/${encodeURIComponent(id)}`);
    return;
  }
  currentNotifications = currentNotifications.filter((n) => n.id !== id);
}

export async function clearAllNotificationsForRoleMock(role: Role): Promise<void> {
  if (role === "AGENT") { enregistrerEtatAgent((await notificationsAgent()).map((n) => n.id), "masque"); return; }
  if (role === "RESPONSABLE") { await client.delete("/responsable/cartes-corporate/echeances/notifications"); return; }
  if (role === "SUPERVISEUR") { await client.delete("/superviseur/notifications"); return; }
  currentNotifications = currentNotifications.filter((n) => n.targetRole !== role);
}

export function addNotificationMock(notif: Omit<AppNotification, "id" | "timestamp" | "read">): void {
  const newId = `notif-${Date.now()}`;
  currentNotifications.unshift({
    ...notif,
    id: newId,
    timestamp: "À l'instant",
    read: false,
  });
}
