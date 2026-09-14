import type {
  AbonnementListItem,
  AbonnementDetail,
  TypeAbonnement,
  EcheancierRelanceInfo,
} from "../features/abonnements/types";
import { formatDate, calculerJoursRestantsAbonnement, soustraireJoursDate } from "../lib/dateUtils";
import { reserverPlaceParkingMock } from "./adminMock";

export function evaluerEcheancierAbonnement(
  _reference: string,
  dateFin: string
): EcheancierRelanceInfo {
  const joursRestants = calculerJoursRestantsAbonnement(dateFin);
  const estExpire = joursRestants <= 0;

  const dateJ10 = soustraireJoursDate(dateFin, 10);
  const dateJ4 = soustraireJoursDate(dateFin, 4);

  const j10Atteinte = joursRestants <= 10;
  const j4Atteinte = joursRestants <= 4;
  const expireAtteint = estExpire;

  let palierActuel: "VALIDE" | "J_MOINS_10" | "J_MOINS_4" | "EXPIRE" = "VALIDE";
  if (expireAtteint) palierActuel = "EXPIRE";
  else if (j4Atteinte) palierActuel = "J_MOINS_4";
  else if (j10Atteinte) palierActuel = "J_MOINS_10";

  return {
    joursRestants,
    estExpire,
    palierActuel,
    etapes: [
      {
        palier: "J_MOINS_10",
        titre: "1ère Relance Préventive (J-10)",
        joursAvantFin: 10,
        datePrevue: dateJ10,
        estAtteinte: j10Atteinte,
        estEnvoyee: j10Atteinte,
        dateDernierEnvoi: j10Atteinte ? `${dateJ10} 09:00` : undefined,
        canal: "BOTH",
      },
      {
        palier: "J_MOINS_4",
        titre: "2ème Relance Urgente (J-4)",
        joursAvantFin: 4,
        datePrevue: dateJ4,
        estAtteinte: j4Atteinte,
        estEnvoyee: j4Atteinte,
        dateDernierEnvoi: j4Atteinte ? `${dateJ4} 10:15` : undefined,
        canal: "BOTH",
      },
      {
        palier: "EXPIRE",
        titre: "Notification 3 : Expiration & Suspension Badge",
        joursAvantFin: 0,
        datePrevue: formatDate(dateFin),
        estAtteinte: expireAtteint,
        estEnvoyee: expireAtteint,
        dateDernierEnvoi: expireAtteint ? `${formatDate(dateFin)} 08:00` : undefined,
        canal: "BOTH",
      },
    ],
  };
}

const mockAbonnements: AbonnementListItem[] = [
  {
    id: 1,
    reference: "ABO-2026-000001",
    type: "REGULIER",
    statut: "ACTIF",
    clientNom: "Karim El Amrani",
    parkingNom: "Parking Bab El Had",
    dateDebut: "20/03/2026",
    dateFin: "20/09/2026", // Expire dans 6 jours -> J-10 transmis
    traiteParNom: "Agent Rachid",
    dateTraitement: "20/03/2026 10:15",
  },
  {
    id: 2,
    reference: "ABO-2026-000002",
    type: "ENTREPRISE",
    statut: "ACTIF",
    clientNom: "Société Atlas Trans",
    parkingNom: "Parking Agdal Gare",
    dateDebut: "01/06/2025",
    dateFin: "01/06/2030", // Longue durée -> Valide
    traiteParNom: "M. Samir El Amrani (Superviseur)",
    dateTraitement: "01/06/2025 14:30",
  },
  {
    id: 3,
    reference: "ABO-2026-000003",
    type: "REGULIER",
    statut: "EXPIRE",
    clientNom: "Sara Bennis",
    parkingNom: "Parking Bab El Had",
    dateDebut: "01/10/2025",
    dateFin: "01/04/2026", // Expiré -> Les 3 notifications transmises
    traiteParNom: "Agent Hassan",
    dateTraitement: "01/10/2025 09:45",
  },
  {
    id: 4,
    reference: "ABO-2026-000004",
    type: "REGULIER",
    statut: "ACTIF",
    clientNom: "Hamza Alami",
    parkingNom: "Parking Hassan II",
    dateDebut: "17/03/2026",
    dateFin: "17/09/2026", // Expire dans 3 jours -> J-4 Urgence transmise
    traiteParNom: "Agent Salma",
    dateTraitement: "17/03/2026 11:00",
  },
  {
    id: 5,
    reference: "ABO-STF-2026-000101",
    type: "STAFF",
    statut: "EN_ATTENTE", // En attente de traitement & validation
    clientNom: "Youssef Tazi (Agent RRM)",
    parkingNom: "Parking Agdal Gare",
    dateDebut: "01/01/2026",
    dateFin: "31/12/2026",
    traiteParNom: undefined,
    dateTraitement: undefined,
  },
  {
    id: 6,
    reference: "ABO-STF-2026-000102",
    type: "STAFF",
    statut: "EN_ATTENTE",
    clientNom: "Meriem Filali (Superviseur RRM)",
    parkingNom: "Parking Hassan II",
    dateDebut: "01/01/2026",
    dateFin: "31/12/2026",
    traiteParNom: undefined,
    dateTraitement: undefined,
  },
  {
    id: 7,
    reference: "ABO-2026-000006",
    type: "REGULIER",
    statut: "EN_ATTENTE",
    clientNom: "Nabil Berrada",
    parkingNom: "Parking Bab El Had",
    dateDebut: "23/08/2026",
    dateFin: "23/02/2027",
    traiteParNom: undefined,
    dateTraitement: undefined,
  },
];

const suspendedMotifs: Record<number, string> = {};

export async function getAbonnementsMock(): Promise<AbonnementListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockAbonnements.map((item) => {
    const echeancier = evaluerEcheancierAbonnement(item.reference, item.dateFin);
    let relanceStatut: "VALIDE" | "RELANCE_J10" | "RELANCE_J4" | "EXPIRE" = "VALIDE";
    if (item.statut === "EXPIRE" || echeancier.estExpire) {
      relanceStatut = "EXPIRE";
    } else if (echeancier.palierActuel === "J_MOINS_4") {
      relanceStatut = "RELANCE_J4";
    } else if (echeancier.palierActuel === "J_MOINS_10") {
      relanceStatut = "RELANCE_J10";
    }

    return {
      ...item,
      dateDebut: formatDate(item.dateDebut),
      dateFin: formatDate(item.dateFin),
      relanceStatut,
    };
  });
}

export interface CreateStaffAbonnementInput {
  type: TypeAbonnement;
  clientNom: string;
  parkingNom: string;
  immatriculation: string;
  numeroMatriculeStaff?: string;
  dureeMois: number;
  exonereStaff: boolean;
}

export async function createStaffAbonnementMock(input: CreateStaffAbonnementInput): Promise<AbonnementListItem> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const newId = mockAbonnements.length + 1;
  const isStaff = input.type === "STAFF";
  const refPrefix = isStaff ? "ABO-STF" : "ABO";
  const reference = `${refPrefix}-2026-${String(newId).padStart(6, "0")}`;

  const today = new Date();
  const dateDebut = formatDate(today.toISOString());
  const endDateObj = new Date(today.setMonth(today.getMonth() + input.dureeMois));
  const dateFin = formatDate(endDateObj.toISOString());

  // Règle RRM : Un abonnement créé débute obligatoirement en EN_ATTENTE
  // Il ne devient ACTIF qu'après traitement effectif par un Agent ou Superviseur
  const newItem: AbonnementListItem = {
    id: newId,
    reference,
    type: input.type,
    statut: "EN_ATTENTE",
    clientNom: isStaff ? `${input.clientNom} (Staff RRM)` : input.clientNom,
    parkingNom: input.parkingNom,
    dateDebut,
    dateFin,
    traiteParNom: undefined, // Reste vide jusqu'au traitement guichet/superviseur
    dateTraitement: undefined,
  };

  const typeClientTarget = input.type === "ENTREPRISE" ? "ENTREPRISE" : "PARTICULIER";
  reserverPlaceParkingMock(1, typeClientTarget, 1);

  mockAbonnements.unshift(newItem);
  return newItem;
}

export interface ActiverAbonnementInput {
  id: number;
  operateurNom: string;
  roleOperateur: string;
  numeroCarteRfid?: string;
}

export async function activerAbonnementMock({
  id,
  operateurNom,
  roleOperateur,
  numeroCarteRfid: _numeroCarteRfid,
}: ActiverAbonnementInput): Promise<AbonnementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const found = mockAbonnements.find((item) => item.id === id);
  if (!found) throw new Error("Abonnement introuvable");

  // Règle d'or : Condition stricte d'activation par un intervenant habilité
  if (!operateurNom || !operateurNom.trim()) {
    throw new Error("L'abonnement ne peut pas être activé sans opérateur traitant (Agent ou Superviseur).");
  }

  found.statut = "ACTIF";
  found.traiteParNom = `${operateurNom} (${roleOperateur})`;
  found.dateTraitement = formatDate(new Date().toISOString());

  return getAbonnementByIdMock(id);
}

export interface SuspendAbonnementInput {
  id: number;
  motif: string;
}

export async function suspendAbonnementMock({ id, motif }: SuspendAbonnementInput): Promise<AbonnementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockAbonnements.find((item) => item.id === id);
  if (found) {
    found.statut = "SUSPENDU";
    suspendedMotifs[id] = motif;
  }
  return getAbonnementByIdMock(id);
}

export async function reactivateAbonnementMock(id: number, operateurNom?: string): Promise<AbonnementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockAbonnements.find((item) => item.id === id);
  if (found) {
    // Ne peut pas être actif s'il n'a jamais été traité
    if (!found.traiteParNom && !operateurNom) {
      throw new Error("L'abonnement ne peut pas être actif sans traitement préalable par un Agent ou Superviseur.");
    }
    if (operateurNom && !found.traiteParNom) {
      found.traiteParNom = operateurNom;
      found.dateTraitement = formatDate(new Date().toISOString());
    }
    found.statut = "ACTIF";
    delete suspendedMotifs[id];
  }
  return getAbonnementByIdMock(id);
}

export async function getAbonnementByIdMock(id: number): Promise<AbonnementDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const found = mockAbonnements.find((item) => item.id === id);

  const reference = found?.reference || `ABO-2026-00000${id}`;
  const dateDebut = formatDate(found?.dateDebut || "15/01/2026");
  const dateFin = formatDate(found?.dateFin || "15/07/2026");
  const echeancierRelance = evaluerEcheancierAbonnement(reference, dateFin);

  return {
    id,
    reference,
    type: found?.type || "REGULIER",
    statut: found?.statut || "EN_ATTENTE",
    clientNom: found?.clientNom || "Karim El Amrani",
    parkingNom: found?.parkingNom || "Parking Bab El Had",
    dateDebut,
    dateFin,
    traiteParNom: found?.traiteParNom,
    dateTraitement: found?.dateTraitement,
    vehiculeImmatriculation: "12345-A-6",
    planTarifaireNom: found?.type === "STAFF" ? "Pass Exonéré Staff RRM" : "Voiture - 6 mois",
    montantTotal: found?.type === "STAFF" ? 0 : 1200,
    motifSuspension: suspendedMotifs[id] || (found?.statut === "SUSPENDU" ? "Suspension administrative" : undefined),
    echeancierRelance,
  };
}