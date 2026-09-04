import { type DemandeListItem, type DemandeDetail, type PaymentInfoInput, type PublicDemandeInput, type DemandeSubmissionResult } from "../features/demandes/types";
import { formatDate } from "../lib/dateUtils";
import { creerFactureMock } from "./facturesMock";

const mockDemandesStore: Record<number, DemandeDetail> = {
  1: {
    id: 1,
    reference: "DEM-2026-000001",
    typeDemande: "NOUVEL_ABONNEMENT",
    statut: "SOUMISE",
    clientNom: "Karim El Amrani",
    typeClient: "PARTICULIER",
    cin: "A748392",
    parkingNom: "Parking Bab El Had",
    forfaitNom: "Pass Permanent (24h / 7j)",
    dureeMois: 6,
    montantTotal: 3600,
    dateCreation: "18/08/2026",
    email: "karim.elamrani@example.com",
    telephone: "0612345678",
    immatriculation: "12345 | أ (A) | 6",
    typeVehicule: "VOITURE",
    agentAffecteNom: "Agent Rachid",
    slaRestantJours: 2,
    slaStatut: "ALERT_3_JOURS",
  },
  2: {
    id: 2,
    reference: "DEM-2026-000002",
    typeDemande: "NOUVEL_ABONNEMENT",
    statut: "SOUMISE",
    clientNom: "Société Atlas Trans",
    typeClient: "ENTREPRISE",
    ice: "001928374000088",
    rc: "998877",
    numeroCarteAbonne: "CRT-2025-001099",
    forfaitNom: "Pass Corporate Permanent (24h / 7j — 650 DH/m/place)",
    dureeMois: 240, // 20 Ans fixe
    montantTotal: 156000,
    parkingNom: "Parking Agdal Gare",
    dateCreation: "22/08/2026",
    email: "contact@atlastrans.ma",
    telephone: "0537001122",
    immatriculation: "99887 | ب (B) | 1",
    typeVehicule: "VOITURE",
    agentAffecteNom: "Mme. Leila Benali (Responsable)",
    traiteParNom: "Mme. Leila Benali (Responsable)",
    roleTraitePar: "RESPONSABLE",
    dateTraitement: "22/08/2026 14:10",
    dureeTraitementJours: 0.5,
    slaRestantJours: 6,
    slaStatut: "DANS_LES_DELAIS",
    paiementInfo: {
      modePaiement: "CHEQUE",
      montant: 156000,
      numeroCheque: "CHQ-889012",
      banque: "ATTIJARI",
      datePaiement: "22/08/2026 14:10",
      validePar: "Mme. Leila Benali (Responsable)",
      remarques: "Chèque certifié + Contrat 20 ans signé & légalisé déposé",
    },
  },
  3: {
    id: 3,
    reference: "DEM-2026-000003",
    typeDemande: "NOUVEL_ABONNEMENT",
    statut: "PAIEMENT_ENREGISTRE",
    clientNom: "Sara Bennis",
    typeClient: "PARTICULIER",
    cin: "B998811",
    forfaitNom: "Pass Journée (08:00 - 20:00)",
    dureeMois: 3,
    montantTotal: 1260,
    parkingNom: "Parking Bab El Had",
    dateCreation: "17/08/2026",
    email: "sara.bennis@example.com",
    telephone: "0677889900",
    immatriculation: "54321 | د (D) | 2",
    typeVehicule: "VOITURE",
    traiteParNom: "Agent Rachid",
    roleTraitePar: "AGENT",
    dateTraitement: "18/08/2026 14:30",
    dureeTraitementJours: 1.0,
    slaRestantJours: 1,
    slaStatut: "ALERT_1_JOUR",
    paiementInfo: {
      modePaiement: "ESPECES",
      montant: 1260,
      datePaiement: "18/08/2026 14:30",
      validePar: "Agent Rachid (Guichet Agdal)",
      remarques: "Paiement en espèces encaissé au guichet principal",
    },
  },
  4: {
    id: 4,
    reference: "DEM-2026-000004",
    typeDemande: "RENOUVELLEMENT",
    statut: "VALIDEE",
    clientNom: "Youssef Tazi",
    typeClient: "PARTICULIER",
    cin: "CD112233",
    numeroCarteAbonne: "CRT-2025-000412",
    forfaitNom: "Pass Permanent (24h / 7j)",
    dureeMois: 12,
    montantTotal: 7200,
    parkingNom: "Parking Hassan II",
    dateCreation: "15/08/2026",
    email: "youssef.tazi@example.com",
    telephone: "0611223344",
    immatriculation: "11223 | أ (A) | 1",
    typeVehicule: "VOITURE",
    traiteParNom: "M. Samir El Amrani (Superviseur)",
    roleTraitePar: "SUPERVISEUR",
    dateTraitement: "17/08/2026 11:15",
    dureeTraitementJours: 2.0,
    slaRestantJours: 5,
    slaStatut: "DANS_LES_DELAIS",
    paiementInfo: {
      modePaiement: "CHEQUE",
      montant: 7200,
      numeroCheque: "CHQ-889012",
      banque: "ATTIJARI",
      datePaiement: "17/08/2026 11:15",
      validePar: "M. Samir El Amrani (Superviseur)",
      remarques: "Paiement chèque vérifié et dossier validé par superviseur",
    },
  },
  5: {
    id: 5,
    reference: "DEM-2026-000005",
    typeDemande: "CHANGEMENT_PARKING",
    statut: "SOUMISE",
    clientNom: "Mehdi Alami",
    typeClient: "PARTICULIER",
    cin: "F445566",
    numeroCarteAbonne: "CRT-2025-000844",
    parkingNom: "Parking Bab El Had",
    nouveauParkingNom: "Parking Agdal Gare",
    dateCreation: "16/08/2026",
    email: "mehdi.alami@example.com",
    telephone: "0655443322",
    immatriculation: "77889 | ج (J) | 4",
    typeVehicule: "VOITURE",
    agentAffecteNom: "Agent Hassan",
    slaRestantJours: 0,
    slaStatut: "DEPASSE",
    motifChangement: "Changement de lieu de travail vers le quartier Agdal.",
  },
  6: {
    id: 6,
    reference: "DEM-2026-000006",
    typeDemande: "PERTE_CARTE",
    statut: "VALIDEE",
    clientNom: "Houda Naciri",
    typeClient: "PARTICULIER",
    cin: "G990011",
    numeroCarteAbonne: "CRT-2025-000310",
    statutCarteAncienne: "DESACTIVEE_BLOQUEE",
    motifPerte: "Déclaration de perte de carte physique lors d'un déplacement à la gare Agdal.",
    fraisDuplicata: 50,
    parkingNom: "Parking Hassan II",
    immatriculation: "88990 | أ (A) | 1",
    dateCreation: "14/08/2026",
    email: "houda.naciri@example.com",
    telephone: "0699887766",
    typeVehicule: "VOITURE",
    traiteParNom: "Agent Hassan",
    roleTraitePar: "AGENT",
    dateTraitement: "15/08/2026 16:45",
    dureeTraitementJours: 1.2,
    slaRestantJours: 5,
    slaStatut: "DANS_LES_DELAIS",
    paiementInfo: {
      modePaiement: "ESPECES",
      montant: 50,
      datePaiement: "15/08/2026 16:45",
      validePar: "Agent Hassan",
      remarques: "Frais de réémission de badge et mise à jour LPR",
    },
  },
};

export interface SlaAgentPerformance {
  agentNom: string;
  role: "AGENT" | "SUPERVISEUR";
  totalTraites: number;
  dureeMoyenneJours: number;
  tauxDansLesDelais: number;
  dansLesDelaisCount: number;
  horsDelaisCount: number;
}

export async function getSlaPerformanceStatsMock() {
  const demandes = Object.values(mockDemandesStore);
  const total = demandes.length;
  const traites = demandes.filter((d) => d.statut === "VALIDEE" || d.statut === "PAIEMENT_ENREGISTRE" || d.statut === "REJETEE");
  const dureeMoyenne = traites.reduce((acc, curr) => acc + (curr.dureeTraitementJours || 1.5), 0) / (traites.length || 1);
  const dansLesDelais = traites.filter((d) => (d.dureeTraitementJours || 1.5) <= 7).length;

  return {
    totalDemandes: total,
    demandesTraitees: traites.length,
    dureeMoyenneJours: Number(dureeMoyenne.toFixed(1)),
    tauxRespectSla: Math.round((dansLesDelais / (traites.length || 1)) * 100),
    demandesEnAlerte: demandes.filter((d) => d.slaStatut === "ALERT_3_JOURS" || d.slaStatut === "ALERT_1_JOUR" || d.slaStatut === "DEPASSE").length,
    agentsPerformance: [
      { agentNom: "Agent Rachid (Agdal)", role: "AGENT", totalTraites: 14, dureeMoyenneJours: 1.5, tauxDansLesDelais: 100, dansLesDelaisCount: 14, horsDelaisCount: 0 },
      { agentNom: "Agent Hassan (Hassan II)", role: "AGENT", totalTraites: 11, dureeMoyenneJours: 2.1, tauxDansLesDelais: 91, dansLesDelaisCount: 10, horsDelaisCount: 1 },
      { agentNom: "M. Samir El Amrani (Superviseur)", role: "SUPERVISEUR", totalTraites: 19, dureeMoyenneJours: 1.1, tauxDansLesDelais: 100, dansLesDelaisCount: 19, horsDelaisCount: 0 },
    ] as SlaAgentPerformance[],
  };
}

export async function getDemandesMock(): Promise<DemandeListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Object.values(mockDemandesStore).map((d) => ({
    id: d.id,
    reference: d.reference,
    typeDemande: d.typeDemande,
    statut: d.statut,
    clientNom: d.clientNom,
    parkingNom: d.parkingNom,
    dateCreation: formatDate(d.dateCreation),
    traiteParNom: d.traiteParNom,
    roleTraitePar: d.roleTraitePar,
    dateTraitement: d.dateTraitement ? formatDate(d.dateTraitement) : undefined,
    dureeTraitementJours: d.dureeTraitementJours,
    slaRestantJours: d.slaRestantJours,
    slaStatut: d.slaStatut,
  }));
}

export async function getDemandeByIdMock(id: number): Promise<DemandeDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockDemandesStore[id];
  if (!found) throw new Error("Demande introuvable");
  return {
    ...found,
    dateCreation: formatDate(found.dateCreation),
    paiementInfo: found.paiementInfo
      ? {
          ...found.paiementInfo,
          datePaiement: formatDate(found.paiementInfo.datePaiement),
        }
      : undefined,
  };
}

export async function submitPublicDemande(input: PublicDemandeInput): Promise<DemandeSubmissionResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newId = Object.keys(mockDemandesStore).length + 100 + Math.floor(Math.random() * 900);
  const reference = `DEM-2026-${String(newId).padStart(6, "0")}`;
  const clientNom = input.typeClient === "ENTREPRISE" && input.raisonSociale
    ? input.raisonSociale
    : `${input.nom || ""} ${input.prenom || ""}`.trim() || "Client Public";

  const newDemande: DemandeDetail = {
    id: newId,
    reference,
    typeDemande: input.typeDemande || "NOUVEL_ABONNEMENT",
    statut: "SOUMISE",
    clientNom,
    parkingNom: input.nouveauParkingNom || "Parking Agdal Gare",
    dateCreation: formatDate(new Date().toISOString()),
    email: input.email,
    telephone: input.telephone,
    immatriculation: input.immatriculation,
    marque: input.marque,
    modele: input.modele,
    typeVehicule: input.typeVehicule,
    typeClient: input.typeClient,
    cin: input.cin,
    ice: input.ice,
    rc: input.rcEntreprise,
    ancienneImmatriculation: input.ancienneImmatriculation,
    forfaitNom: input.forfaitNom || (input.typeClient === "ENTREPRISE" ? "Pass Corporate 08:00 - 20:00 (500 DH/m/place)" : "Pass Permanent (24h / 7j)"),
    dureeMois: input.dureeMois || (input.typeClient === "ENTREPRISE" ? 240 : 3),
    nombreAbonnements: input.nombreAbonnements || 1,
    montantTotal: input.montantTotal || 1800,
    modePaiement: (input as any).modePaiement || "ESPECES",
  };

  mockDemandesStore[newId] = newDemande;
  return { reference };
}

export async function searchDemandeByReferenceMock(query: string): Promise<DemandeDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const q = query.trim().toUpperCase();
  if (!q) return null;
  const found = Object.values(mockDemandesStore).find(
    (d) =>
      d.reference.toUpperCase() === q ||
      d.email.toUpperCase() === q ||
      d.telephone === q ||
      (d.cin && d.cin.toUpperCase() === q) ||
      (d.ice && d.ice === q)
  );
  if (!found) return null;
  return {
    ...found,
    dateCreation: formatDate(found.dateCreation),
    paiementInfo: found.paiementInfo
      ? {
          ...found.paiementInfo,
          datePaiement: formatDate(found.paiementInfo.datePaiement),
        }
      : undefined,
  };
}

export async function updatePublicDemandeMock(reference: string, updates: Partial<DemandeDetail>): Promise<DemandeDetail> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const refClean = reference.trim().toUpperCase();
  const entry = Object.entries(mockDemandesStore).find(([_, d]) => d.reference.toUpperCase() === refClean);
  if (!entry) {
    throw new Error(`Dossier avec la référence ${reference} introuvable.`);
  }
  const [idStr, currentDemande] = entry;
  const id = Number(idStr);

  const updated: DemandeDetail = {
    ...currentDemande,
    ...updates,
    statut: currentDemande.statut === "REJETEE" ? "CORRIGEE" : currentDemande.statut,
  };

  mockDemandesStore[id] = updated;
  return updated;
}

export async function validerDemandeMock(id: number, _decision?: any, _validePar?: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (mockDemandesStore[id]) {
    mockDemandesStore[id].statut = "VALIDEE";
  }
}

export const addPublicDemandeMock = submitPublicDemande;
export const enregistrerPaiementAgentMock = submitPaiementGuichetMock;

export async function submitPaiementGuichetMock(id: number, paymentInfo: PaymentInfoInput, actorName?: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (mockDemandesStore[id]) {
    const dem = mockDemandesStore[id];
    dem.statut = "PAIEMENT_ENREGISTRE";
    dem.paiementInfo = {
      ...paymentInfo,
      datePaiement: formatDate(new Date().toISOString()),
      validePar: actorName || "Agent Guichet (Agent)",
    };

    // Automatic creation of official invoice for every recorded payment
    const isNouvel = dem.typeDemande === "NOUVEL_ABONNEMENT";
    const isPerte = dem.typeDemande === "PERTE_CARTE";
    const fraisCarte = (isNouvel || isPerte) ? 50 : 0;

    await creerFactureMock({
      clientNom: dem.clientNom,
      abonnementReference: `ABO-2026-${String(id).padStart(6, "0")}`,
      montantTtc: paymentInfo.montant,
      fraisCarteRfid: fraisCarte,
      genereePar: actorName || "Agent Guichet (Agent)",
      modePaiement: paymentInfo.modePaiement,
    });
  }
}

export interface RenewalSubscriber {
  id: number;
  referenceAbonnement: string;
  numeroCarte: string;
  clientNom: string;
  cin: string;
  email: string;
  telephone: string;
  parkingNom: string;
  immatriculation: string;
  typeVehicule: string;
  forfaitNom: string;
  montantMensuel: number;
  dateFinActuelle: string;
  statut: "ACTIF" | "EXPIRE";
}

const mockRenewalSubscribers: RenewalSubscriber[] = [
  {
    id: 101,
    referenceAbonnement: "ABO-2026-000001",
    numeroCarte: "CRT-992014",
    clientNom: "Karim El Amrani",
    cin: "AB123456",
    email: "karim.elamrani@example.com",
    telephone: "0612345678",
    parkingNom: "Parking Bab El Had",
    immatriculation: "12345-A-6",
    typeVehicule: "VOITURE",
    forfaitNom: "Pass Permanent (24h / 7j)",
    montantMensuel: 600,
    dateFinActuelle: "31/07/2026",
    statut: "EXPIRE",
  },
  {
    id: 102,
    referenceAbonnement: "ABO-2026-000002",
    numeroCarte: "CRT-449102",
    clientNom: "Société Atlas Trans",
    cin: "ICE-001234567",
    email: "contact@atlastrans.ma",
    telephone: "0537001122",
    parkingNom: "Parking Agdal Gare",
    immatriculation: "99887-B-1",
    typeVehicule: "VOITURE",
    forfaitNom: "Abonnement Corporate (Flotte)",
    montantMensuel: 5400,
    dateFinActuelle: "31/08/2026",
    statut: "ACTIF",
  },
  {
    id: 103,
    referenceAbonnement: "ABO-2026-000003",
    numeroCarte: "CRT-330192",
    clientNom: "Sara Bennis",
    cin: "CD789012",
    email: "sara.bennis@example.com",
    telephone: "0677889900",
    parkingNom: "Parking Bab El Had",
    immatriculation: "54321-D-2",
    typeVehicule: "VOITURE",
    forfaitNom: "Pass Journée (08:00 - 20:00)",
    montantMensuel: 420,
    dateFinActuelle: "15/08/2026",
    statut: "EXPIRE",
  },
];

export async function searchSubscriptionsForRenewalMock(query: string): Promise<RenewalSubscriber[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const q = query.trim().toUpperCase();
  if (!q) return [];
  return mockRenewalSubscribers.filter(
    (s) =>
      s.cin.toUpperCase().includes(q) ||
      s.clientNom.toUpperCase().includes(q) ||
      s.immatriculation.toUpperCase().includes(q) ||
      s.referenceAbonnement.toUpperCase().includes(q) ||
      s.numeroCarte.toUpperCase().includes(q)
  );
}

export interface DirectRenewalInput {
  subscriberId: number;
  forfaitNom?: string;
  dureeMois?: number;
  montantTotal?: number;
  paymentInfo: PaymentInfoInput;
  actorName?: string;
}

export async function addRenouvellementDirectMock(input: DirectRenewalInput): Promise<DemandeSubmissionResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const sub = mockRenewalSubscribers.find((s) => s.id === input.subscriberId) || mockRenewalSubscribers[0];
  const newId = Object.keys(mockDemandesStore).length + 200 + Math.floor(Math.random() * 500);
  const reference = `DEM-2026-RNW${String(newId).padStart(5, "0")}`;

  const newDemande: DemandeDetail = {
    id: newId,
    reference,
    typeDemande: "RENOUVELLEMENT",
    statut: "VALIDEE",
    clientNom: sub.clientNom,
    parkingNom: sub.parkingNom,
    dateCreation: formatDate(new Date().toISOString()),
    email: sub.email,
    telephone: sub.telephone,
    immatriculation: sub.immatriculation,
    typeVehicule: sub.typeVehicule,
    paiementInfo: {
      ...input.paymentInfo,
      montant: input.montantTotal || input.paymentInfo.montant,
      datePaiement: formatDate(new Date().toISOString()),
      validePar: input.actorName ?? "Agent / Superviseur",
      remarques: input.paymentInfo.remarques || `Renouvellement (${input.forfaitNom || sub.forfaitNom} - ${input.dureeMois || 1} mois) - Abonnement ${sub.referenceAbonnement}`,
    },
  };

  mockDemandesStore[newId] = newDemande;
  return { reference };
}

export async function rejeterDemandeMock(id: number, raison: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (mockDemandesStore[id]) {
    mockDemandesStore[id].statut = "REJETEE";
    mockDemandesStore[id].raisonRejet = raison;
  }
}