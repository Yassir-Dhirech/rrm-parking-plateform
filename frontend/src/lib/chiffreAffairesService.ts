/**
 * Service Centralisé de Calcul et Synchronisation du Chiffre d'Affaires (CA)
 * Utilisé conjointement par le RESPONSABLE et le COMPTABLE pour garantir
 * une vision financière unique, cohérente et temps réel sur l'ensemble du réseau RRM.
 */

export interface ParkingCARef {
  id: number;
  nom: string;
  code: string;
  caTotal: number;
  caAbos: number;
  caAbosParticuliers: number;
  caAbosCorporate: number;
  caTickets: number;
  caEspeces: number;
  caCheques: number;
  recettesValideesComptable: number;
  recettesEnAttenteVisa: number;
  facturesFiscalesEmises: number;
}

export const SYNCHRONIZED_PARKINGS_CA: ParkingCARef[] = [
  {
    id: 3,
    nom: "Parking Bab El Had",
    code: "BEH",
    caTotal: 235000,
    caAbos: 165000,
    caAbosParticuliers: 95000,
    caAbosCorporate: 70000,
    caTickets: 70000,
    caEspeces: 141000,
    caCheques: 94000,
    recettesValideesComptable: 48500, // Validé quittance reçu par comptable
    recettesEnAttenteVisa: 0,
    facturesFiscalesEmises: 3730,
  },
  {
    id: 1,
    nom: "Parking Agdal Gare",
    code: "AGD",
    caTotal: 155000,
    caAbos: 110000,
    caAbosParticuliers: 52000,
    caAbosCorporate: 58000,
    caTickets: 45000,
    caEspeces: 85250,
    caCheques: 69750,
    recettesValideesComptable: 0,
    recettesEnAttenteVisa: 32400, // En attente de validation physique comptable
    facturesFiscalesEmises: 54500, // Grand compte Atlas Trans
  },
  {
    id: 2,
    nom: "Parking Hassan II",
    code: "HSS",
    caTotal: 98000,
    caAbos: 72000,
    caAbosParticuliers: 38000,
    caAbosCorporate: 34000,
    caTickets: 26000,
    caEspeces: 53900,
    caCheques: 44100,
    recettesValideesComptable: 0,
    recettesEnAttenteVisa: 0,
    facturesFiscalesEmises: 0,
  },
  {
    id: 4,
    nom: "Parking Chellah",
    code: "CHL",
    caTotal: 60000,
    caAbos: 44000,
    caAbosParticuliers: 24000,
    caAbosCorporate: 20000,
    caTickets: 16000,
    caEspeces: 33000,
    caCheques: 27000,
    recettesValideesComptable: 0,
    recettesEnAttenteVisa: 0,
    facturesFiscalesEmises: 0,
  },
];

export interface ConsolidatedRevenueSummary {
  caTotal: number;
  caAbos: number;
  caAbosParticuliers: number;
  caAbosCorporate: number;
  caTickets: number;
  caEspeces: number;
  caCheques: number;
  recettesValideesComptable: number;
  recettesEnAttenteVisa: number;
  facturesFiscalesEmises: number;
  tauxRecouvrement: number;
}

/**
 * Calcule les indicateurs de chiffre d'affaires consolidés.
 * Si un parking spécifique est sélectionné, filtre sur ce site.
 * Sinon, renvoie les totaux de l'ensemble du réseau (548 000 MAD).
 */
export function getConsolidatedRevenue(parkingId?: number | null): ConsolidatedRevenueSummary {
  const dataset = parkingId
    ? SYNCHRONIZED_PARKINGS_CA.filter((p) => p.id === parkingId)
    : SYNCHRONIZED_PARKINGS_CA;

  const caTotal = dataset.reduce((sum, p) => sum + p.caTotal, 0);
  const caAbos = dataset.reduce((sum, p) => sum + p.caAbos, 0);
  const caAbosParticuliers = dataset.reduce((sum, p) => sum + p.caAbosParticuliers, 0);
  const caAbosCorporate = dataset.reduce((sum, p) => sum + p.caAbosCorporate, 0);
  const caTickets = dataset.reduce((sum, p) => sum + p.caTickets, 0);
  const caEspeces = dataset.reduce((sum, p) => sum + p.caEspeces, 0);
  const caCheques = dataset.reduce((sum, p) => sum + p.caCheques, 0);
  const recettesValideesComptable = dataset.reduce((sum, p) => sum + p.recettesValideesComptable, 0);
  const recettesEnAttenteVisa = dataset.reduce((sum, p) => sum + p.recettesEnAttenteVisa, 0);
  const facturesFiscalesEmises = dataset.reduce((sum, p) => sum + p.facturesFiscalesEmises, 0);

  return {
    caTotal,
    caAbos,
    caAbosParticuliers,
    caAbosCorporate,
    caTickets,
    caEspeces,
    caCheques,
    recettesValideesComptable,
    recettesEnAttenteVisa,
    facturesFiscalesEmises,
    tauxRecouvrement: 98.4,
  };
}
