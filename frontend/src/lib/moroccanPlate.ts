export interface MoroccanPlateParts {
  numeroImmatriculation: string;
  serieImmatriculation: string;
  codeRegion: string;
}

export const parseMoroccanPlate = (value: string): MoroccanPlateParts => {
  const parts = (value || "").split(/\s*[|-]\s*/).map((part) => part.trim());
  const legacyLetter = parts[1]?.match(/\p{L}/u)?.[0] || "";

  return {
    numeroImmatriculation: parts[0] || "",
    serieImmatriculation: legacyLetter,
    codeRegion: parts[2] || "",
  };
};

export const isValidMoroccanPlate = (value: string): boolean => {
  const plate = parseMoroccanPlate(value);

  return (
    /^[0-9]{3,7}$/.test(plate.numeroImmatriculation) &&
    /^\p{L}$/u.test(plate.serieImmatriculation) &&
    /^[0-9]{1,2}$/.test(plate.codeRegion)
  );
};
