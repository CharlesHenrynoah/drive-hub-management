
// Liste des types de carburants
export const fuelTypes = [
  "Diesel",
  "Essence",
  "Électrique",
  "Hybride",
  "GNV",
  "Biodiesel",
  "Hydrogène",
];

// Liste des statuts de véhicule
export const vehicleStatuses = ["Disponible", "En maintenance", "Hors service", "En mission"];

// Liste des villes pour la localisation
export const cities = [
  "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg",
  "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre",
  "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Clermont-Ferrand"
];

// Liste des types de véhicules avec les capacités correctes
export const vehicleTypes = [
  { value: "Berline", label: "Berline (3 à 4 passagers)" },
  { value: "Van", label: "Van (6 à 8 passagers)" },
  { value: "Minibus", label: "Minibus (8 à 19 passagers)" },
  { value: "Minicar", label: "Minicar (20 à 38 passagers)" },
  { value: "Autocar Standard", label: "Autocar Standard (38 à 55 passagers)" },
  { value: "Autocar Grand Tourisme", label: "Autocar Grand Tourisme (66 à 93 passagers - double étage)" },
  { value: "VTC", label: "VTC (3 à 4 passagers)" }
];

// Capacités par défaut pour chaque type de véhicule (valeur médiane de la plage)
export const getDefaultCapacityByType = (vehicleType: string): number => {
  switch(vehicleType) {
    case "Berline":
      return 4;
    case "Van":
      return 7;
    case "Minibus":
      return 14;
    case "Minicar":
      return 29;
    case "Autocar Standard":
      return 46;
    case "Autocar Grand Tourisme":
      return 80;
    case "VTC":
      return 4;
    default:
      return 0;
  }
};
