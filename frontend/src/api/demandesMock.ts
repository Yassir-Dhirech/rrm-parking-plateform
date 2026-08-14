import { type DemandeListItem, type DemandeDetail, type PaymentInfoInput } from "../features/demandes/types";

const mockDemandesStore: Record<number, DemandeDetail> = {
  1: {
    id: 1,
    reference: "DEM-2026-000001",
    typeDemande: "NOUVEL_ABONNEMENT",
    statut: "SOUMISE",
    clientNom: "Karim El Amrani",
    parkingNom: "Parking Bab El Had",
    dateCreation: "2026-07-28",
    email: "karim.elamrani@example.com",
    telephone: "0612345678",
    immatriculation: "12345-A-6",
    typeVehicule: "VOITURE",
  },
  2: {
    id: 2,
    reference: "DEM-2026-000002",
    typeDemande: "RENOUVELLEMENT",
    statut: "EN_COURS",
    clientNom: "Société Atlas Trans",
    parkingNom: "Parking Agdal",
    dateCreation: "2026-07-29",
    email: "contact@atlastrans.ma",
    telephone: "0537001122",
    immatriculation: "99887-B-1",
    typeVehicule: "CAMIONNETTE",
  },
  3: {
    id: 3,
    reference: "DEM-2026-000003",
    typeDemande: "NOUVEL_ABONNEMENT",
    statut: "VALIDEE",
    clientNom: "Sara Bennis",
    parkingNom: "Parking Bab El Had",
    dateCreation: "2026-07-27",
    email: "sara.bennis@example.com",
    telephone: "0677889900",
    immatriculation: "54321-D-2",
    typeVehicule: "VOITURE",
    paiementInfo: {
      modePaiement: "ESPECES",
      montant: 450,
      datePaiement: "2026-07-27 14:30",
      validePar: "Agent / Superviseur",
      remarques: "Paiement au guichet principal",
    },
  },
};

export async function getDemandesMock(): Promise<DemandeListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Object.values(mockDemandesStore).map(({ email, telephone, immatriculation, typeVehicule, raisonRejet, paiementInfo, ...item }) => item);
}

export async function getDemandeByIdMock(id: number): Promise<DemandeDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!mockDemandesStore[id]) {
    return {
      id,
      reference: `DEM-2026-00000${id}`,
      typeDemande: "NOUVEL_ABONNEMENT",
      statut: "SOUMISE",
      clientNom: "Karim El Amrani",
      parkingNom: "Parking Bab El Had",
      dateCreation: "2026-07-28",
      email: "karim.elamrani@example.com",
      telephone: "0612345678",
      immatriculation: "12345-A-6",
      typeVehicule: "VOITURE",
    };
  }
  return mockDemandesStore[id];
}

export async function validerDemandeMock(id: number, paymentInfo?: PaymentInfoInput, actorName?: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (mockDemandesStore[id]) {
    mockDemandesStore[id].statut = "VALIDEE";
    if (paymentInfo) {
      mockDemandesStore[id].paiementInfo = {
        ...paymentInfo,
        datePaiement: new Date().toISOString().slice(0, 16).replace("T", " "),
        validePar: actorName ?? "Agent / Superviseur",
      };
    }
  }
  console.log(`Demande ${id} validée avec paiements mock`, paymentInfo);
}

export async function rejeterDemandeMock(id: number, raison: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (mockDemandesStore[id]) {
    mockDemandesStore[id].statut = "REJETEE";
    mockDemandesStore[id].raisonRejet = raison;
  }
  console.log(`Demande ${id} rejetée (mock), raison: ${raison}`);
}