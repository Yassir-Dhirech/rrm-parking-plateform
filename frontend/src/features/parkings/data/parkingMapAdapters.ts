import type { Parking } from "../../../api/parkings";

export type ParkingSaturation = "FLUIDE" | "MODERE" | "PRESQUE_COMPLET";

export type ParkingMapItem = Parking & {
  latitude: number;
  longitude: number;
  numeroPin: number;
  statutSaturation: ParkingSaturation;
};

export function getParkingSaturation(tauxOccupation: number): ParkingSaturation {
  if (tauxOccupation >= 85) return "PRESQUE_COMPLET";
  if (tauxOccupation >= 60) return "MODERE";
  return "FLUIDE";
}

export function toParkingMapItems(parkings: Parking[]): ParkingMapItem[] {
  return parkings
    .filter(
      (parking): parking is Parking & { latitude: number; longitude: number } =>
        Number.isFinite(parking.latitude) && Number.isFinite(parking.longitude)
    )
    .map((parking, index) => ({
      ...parking,
      numeroPin: index + 1,
      statutSaturation: getParkingSaturation(parking.tauxOccupationAbonnements),
    }));
}
