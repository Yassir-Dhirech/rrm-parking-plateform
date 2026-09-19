import type { CarteListItem, CarteDetail } from "../features/cartes/types";

const mockCartes: CarteDetail[] = [
  {
    id: 1,
    numeroCarte: "CARD-000123",
    statut: "TESTEE_PRET_A_RECUPERER",
    abonnementReference: "ABO-2026-000001",
    clientNom: "Karim El Amrani",
    datePreparation: "16/08/2026",
    preparePar: "Agent Rachid",
    estImprimee: true,
    dateImpression: "17/08/2026 09:30",
    estTestee: true,
    dateTest: "17/08/2026 10:00",
    testePar: "Agent Rachid (Guichet Agdal)",
    estDelivree: false,
  },
  {
    id: 2,
    numeroCarte: "CARD-000124",
    statut: "DELIVREE_ACTIVE",
    abonnementReference: "ABO-2026-000002",
    clientNom: "Société Atlas Trans",
    datePreparation: "22/08/2026",
    preparePar: "Mme. Leila Benali (Responsable)",
    dateActivation: "22/08/2026 14:15",
    activePar: "Mme. Leila Benali",
    estImprimee: true,
    dateImpression: "22/08/2026 11:00",
    estTestee: true,
    dateTest: "22/08/2026 11:30",
    testePar: "Agent Rachid (Guichet Agdal)",
    estDelivree: true,
    dateDelivrance: "22/08/2026 14:30",
    delivreePar: "Agent Rachid (Guichet Agdal)",
  },
  {
    id: 3,
    numeroCarte: "CARD-000125",
    statut: "EN_ATTENTE_IMPRESSION",
    abonnementReference: "ABO-2026-000003",
    clientNom: "Sara Bennis",
    datePreparation: "24/08/2026",
    preparePar: "Agent Rachid",
    estImprimee: false,
    estTestee: false,
    estDelivree: false,
  },
  {
    id: 4,
    numeroCarte: "CARD-000126",
    statut: "IMPRIMEE_NON_TESTEE",
    abonnementReference: "ABO-2026-000004",
    clientNom: "Youssef Tazi",
    datePreparation: "25/08/2026",
    preparePar: "Agent Hassan",
    estImprimee: true,
    dateImpression: "25/08/2026 15:30",
    estTestee: false,
    estDelivree: false,
  },
];

export async function getCartesMock(): Promise<CarteListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockCartes;
}

export async function getCarteByIdMock(id: number): Promise<CarteDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockCartes.find((c) => c.id === id);
  return found || mockCartes[0];
}

export async function toggleCarteStepMock(id: number, step: "IMPRESSION" | "TEST" | "DELIVRANCE"): Promise<CarteDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const card = mockCartes.find((c) => c.id === id);
  if (card) {
    if (step === "IMPRESSION") {
      card.estImprimee = !card.estImprimee;
      card.dateImpression = card.estImprimee ? "28/08/2026 14:00" : undefined;
    } else if (step === "TEST") {
      card.estTestee = !card.estTestee;
      card.dateTest = card.estTestee ? "28/08/2026 14:15" : undefined;
      card.testePar = card.estTestee ? "Agent Rachid (Guichet)" : undefined;
    } else if (step === "DELIVRANCE") {
      card.estDelivree = !card.estDelivree;
      card.dateDelivrance = card.estDelivree ? "28/08/2026 14:30" : undefined;
      card.delivreePar = card.estDelivree ? "Agent Rachid (Guichet)" : undefined;
      if (card.estDelivree) card.statut = "ACTIVE";
    }
    return { ...card };
  }
  return mockCartes[0];
}

export async function activerCarteMock(id: number, note: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`Carte ${id} activée (mock), note: ${note}`);
}