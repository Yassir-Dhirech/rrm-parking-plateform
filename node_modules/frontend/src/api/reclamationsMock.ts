import type { PublicReclamationInput, ReclamationItem } from "../features/reclamations/types";
import { formatDate } from "../lib/dateUtils";
import { addNotificationMock } from "./notificationsMock";

const mockReclamationsStore: ReclamationItem[] = [
  {
    id: 1,
    reference: "RECL-2026-000081",
    nomPrenom: "Tarik Mansouri",
    email: "tarik.m@example.com",
    telephone: "0661223344",
    parkingId: 1,
    parkingNom: "Parking Agdal Gare",
    typeReclamation: "LPR_BARRIERE",
    immatriculation: "44556-A-1",
    descriptionDetaillee: "La caméra LPR n'a pas reconnu ma plaque 44556-A-1 lors de ma sortie à 18h20 hier soir.",
    dateCreation: "22/08/2026",
    statut: "EN_COURS",
    traiteParNom: "Agent Rachid",
  },
  {
    id: 2,
    reference: "RECL-2026-000082",
    nomPrenom: "Khadija Benjelloun",
    email: "khadija.b@example.com",
    telephone: "0655443322",
    parkingId: 2,
    parkingNom: "Parking Hassan II",
    typeReclamation: "FACTURATION_SURCHARGE",
    numeroTicketOuCarte: "TCK-889012",
    descriptionDetaillee: "J'ai été débitée de 40 MAD au lieu de 20 MAD pour un stationnement de 1h30.",
    dateCreation: "21/08/2026",
    statut: "SOUMISE",
  },
];

export async function getReclamationsMock(): Promise<ReclamationItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockReclamationsStore;
}

export async function creerReclamationMock(input: PublicReclamationInput): Promise<ReclamationItem> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const newId = mockReclamationsStore.length + 1;
  const newRef = `RECL-2026-${String(newId).padStart(6, "0")}`;

  const newReclamation: ReclamationItem = {
    ...input,
    id: newId,
    reference: newRef,
    dateCreation: formatDate(new Date().toISOString()),
    statut: "SOUMISE",
  };

  mockReclamationsStore.unshift(newReclamation);

  // Dispatch high-priority alert notification to Agents & Supervisors
  addNotificationMock({
    title: `Nouvelle Réclamation Client (${newRef})`,
    message: `Réclamation déposée par ${input.nomPrenom} pour ${input.parkingNom} - Motif : ${input.typeReclamation}.`,
    type: "warning",
    category: "DOSSIER",
    targetRole: "AGENT",
    link: "/agent/demandes",
  });

  addNotificationMock({
    title: `Service Client : Réclamation (${newRef})`,
    message: `Incident signalé pour ${input.parkingNom} par ${input.nomPrenom} (${input.telephone}).`,
    type: "warning",
    category: "DOSSIER",
    targetRole: "SUPERVISEUR",
    link: "/superviseur/demandes",
  });

  return newReclamation;
}
