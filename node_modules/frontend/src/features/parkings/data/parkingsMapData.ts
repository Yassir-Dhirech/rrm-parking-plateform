export interface RabatParkingMapItem {
  id: number;
  numeroPin: number;
  code: string;
  nomComplet: string;
  quartier: string;
  adresse: string;
  lat: number;
  lng: number;
  placesAbonnesLibres: number;
  placesAbonnesTotal: number;
  statutSaturation: "FLUIDE" | "MODERE" | "PRESQUE_COMPLET";
  tarifsAbonnementMensuel: string;
}

export const RABAT_PARKINGS_MAP_DATA: RabatParkingMapItem[] = [
  {
    id: 1,
    numeroPin: 1,
    code: "PKG-AGDAL",
    nomComplet: "Parking Agdal Gare (Gare Rabat-Agdal)",
    quartier: "Agdal",
    adresse: "Avenue Hadj Ahmed Balafrej, Agdal, Rabat",
    lat: 34.0012,
    lng: -6.8491,
    placesAbonnesLibres: 82,
    placesAbonnesTotal: 270,
    statutSaturation: "FLUIDE",
    tarifsAbonnementMensuel: "À partir de 420 MAD/mois",
  },
  {
    id: 2,
    numeroPin: 2,
    code: "PKG-BAB-EL-HAD",
    nomComplet: "Parking Bab El Had (Place Bab El Had — Médina)",
    quartier: "Centre-Ville / Médina",
    adresse: "Boulevard Hassan II, Bab El Had, Rabat",
    lat: 34.0205,
    lng: -6.8375,
    placesAbonnesLibres: 45,
    placesAbonnesTotal: 228,
    statutSaturation: "MODERE",
    tarifsAbonnementMensuel: "À partir de 420 MAD/mois",
  },
  {
    id: 3,
    numeroPin: 3,
    code: "PKG-HASSAN-II",
    nomComplet: "Parking Hassan II (Avenue Hassan II)",
    quartier: "Hassan",
    adresse: "Avenue Hassan II, Centre-Ville, Rabat",
    lat: 34.0248,
    lng: -6.8320,
    placesAbonnesLibres: 120,
    placesAbonnesTotal: 300,
    statutSaturation: "FLUIDE",
    tarifsAbonnementMensuel: "À partir de 450 MAD/mois",
  },
  {
    id: 4,
    numeroPin: 4,
    code: "PKG-CHELLAH",
    nomComplet: "Parking Chellah (Avenue Yacoub El Mansour)",
    quartier: "Chellah / Ville Haute",
    adresse: "Avenue Yacoub El Mansour, Quartier Chellah, Rabat",
    lat: 34.0068,
    lng: -6.8290,
    placesAbonnesLibres: 38,
    placesAbonnesTotal: 180,
    statutSaturation: "MODERE",
    tarifsAbonnementMensuel: "À partir de 400 MAD/mois",
  },
  {
    id: 5,
    numeroPin: 5,
    code: "PKG-BAB-SOUK",
    nomComplet: "Parking Bab Souk El Akhed",
    quartier: "Bab Souk / Médina",
    adresse: "Avenue Ibn Toumert, Rabat",
    lat: 34.0175,
    lng: -6.8390,
    placesAbonnesLibres: 20,
    placesAbonnesTotal: 150,
    statutSaturation: "PRESQUE_COMPLET",
    tarifsAbonnementMensuel: "À partir de 420 MAD/mois",
  },
];
