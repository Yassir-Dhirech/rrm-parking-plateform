import { type TypeVehicule } from "../lib/enums";

export interface SubscriberRecord {
  id: string;
  referenceAbonnement: string;
  numeroCarteAbonne: string;
  nom: string;
  prenom: string;
  cin: string;
  email: string;
  telephone: string;
  immatriculation: string;
  marque?: string;
  modele?: string;
  typeVehicule: TypeVehicule;
  parkingId: number;
  parkingNom: string;
  forfaitId: number;
  forfaitNom: string;
  dureeMoisRestants?: number;
}

const mockSubscribersDatabase: SubscriberRecord[] = [
  {
    id: "sub-1",
    referenceAbonnement: "ABN-2025-001099",
    numeroCarteAbonne: "CRT-2025-001099",
    nom: "El Amrani",
    prenom: "Karim",
    cin: "AB123456",
    email: "karim.elamrani@example.com",
    telephone: "0612345678",
    immatriculation: "12345-A-6",
    marque: "Dacia",
    modele: "Sandero",
    typeVehicule: "VOITURE",
    parkingId: 1,
    parkingNom: "Parking Agdal Gare",
    forfaitId: 1,
    forfaitNom: "Pass Permanent (24h / 7j)",
  },
  {
    id: "sub-2",
    referenceAbonnement: "ABN-2025-002044",
    numeroCarteAbonne: "CRT-2025-002044",
    nom: "Société Atlas Trans",
    prenom: "Atlas",
    cin: "001234567000089",
    email: "contact@atlastrans.ma",
    telephone: "0537001122",
    immatriculation: "99887-B-1",
    marque: "Peugeot",
    modele: "Boxer",
    typeVehicule: "VOITURE",
    parkingId: 1,
    parkingNom: "Parking Agdal Gare",
    forfaitId: 4,
    forfaitNom: "Abonnement Corporate (Flotte)",
  },
  {
    id: "sub-3",
    referenceAbonnement: "ABN-2025-003421",
    numeroCarteAbonne: "CRT-2025-003421",
    nom: "Bennis",
    prenom: "Sara",
    cin: "CD987654",
    email: "sara.bennis@example.com",
    telephone: "0677889900",
    immatriculation: "54321-D-2",
    marque: "Renault",
    modele: "Clio",
    typeVehicule: "VOITURE",
    parkingId: 2,
    parkingNom: "Parking Bab El Had",
    forfaitId: 2,
    forfaitNom: "Pass Journée (08:00 - 20:00)",
  },
  {
    id: "sub-4",
    referenceAbonnement: "ABN-2025-004812",
    numeroCarteAbonne: "CRT-2025-004812",
    nom: "Tazi",
    prenom: "Youssef",
    cin: "EF556677",
    email: "youssef.tazi@example.com",
    telephone: "0611223344",
    immatriculation: "11223-A-1",
    marque: "Volkswagen",
    modele: "Golf",
    typeVehicule: "VOITURE",
    parkingId: 3,
    parkingNom: "Parking Hassan II",
    forfaitId: 1,
    forfaitNom: "Pass Permanent (24h / 7j)",
  },
];

export async function searchSubscriberByCinOrCardMock(query: string): Promise<SubscriberRecord | null> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  if (!query || !query.trim()) return null;

  const q = query.trim().toLowerCase();
  const match = mockSubscribersDatabase.find(
    (s) =>
      s.cin.toLowerCase() === q ||
      s.numeroCarteAbonne.toLowerCase() === q ||
      s.referenceAbonnement.toLowerCase() === q ||
      s.email.toLowerCase() === q ||
      s.immatriculation.toLowerCase() === q ||
      `${s.prenom} ${s.nom}`.toLowerCase().includes(q)
  );

  return match || null;
}
