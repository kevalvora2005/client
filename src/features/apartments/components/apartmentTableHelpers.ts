import i18n from 'i18next';

export const formatArea = (area: number): string =>
  area.toLocaleString(i18n.language || "en-IN");

export const formatFloor = (floor: number): string => {
  if (floor === 0) return i18n.t("apartments.ground_floor");
  const lang = i18n.language || "en";
  if (lang.startsWith("en")) {
    const suffix = ["th", "st", "nd", "rd"];
    const v = floor % 100;
    return `${floor}${suffix[(v - 20) % 10] || suffix[v] || suffix[0]} Floor`;
  }
  return i18n.t("apartments.floor_suffix", { floor });
};

export const apartmentTypeLabels: Record<string, string> = {
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
  "4bhk": "4 BHK",
};