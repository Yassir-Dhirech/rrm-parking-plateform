import { type DemandeListItem } from "../features/demandes/types";

const mockDemandes: DemandeListItem[] = [
  {
    id: 1,
    reference: "DEM-2026-000001",
    typeDemande: "NOUVEL_ABONNEMENT",
    statut: "SOUMISE",
    clientNom: "Karim El Amrani",
    parkingNom: "Parking Bab El Had",
    dateCreation: "2026-07-28",
  },
  {
    id: 2,
    reference: "DEM-2026-000002",
    typeDemande: "RENOUVELLEMENT",
    statut: "EN_COURS",
    clientNom: "Société Atlas Trans",
    parkingNom: "Parking Agdal",
    dateCreation: "2026-07-29",
  },
  {
    id: 3,
    reference: "DEM-2026-000003",
    typeDemande: "NOUVEL_ABONNEMENT",
    statut: "VALIDEE",
    clientNom: "Sara Bennis",
    parkingNom: "Parking Bab El Had",
    dateCreation: "2026-07-27",
  },
];

export async function getDemandesMock(): Promise<DemandeListItem[]> {
  // simulate network delay so loading states are visible during dev
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockDemandes;
}

import { type DemandeDetail } from "../features/demandes/types";

export async function getDemandeByIdMock(id: number): Promise<DemandeDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));
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

export async function validerDemandeMock(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`Demande ${id} validée (mock)`);
}

export async function rejeterDemandeMock(id: number, raison: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log(`Demande ${id} rejetée (mock), raison: ${raison}`);
}